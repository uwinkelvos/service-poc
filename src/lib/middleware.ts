import * as z from "zod";
import * as Koa from "koa";
import { ParsedUrlQuery } from "querystring";

interface RequestSchemas<B = never, Q = never, P = never> {
	body?: z.ZodType<B, z.ZodAnyDef, unknown>;
	query?: z.ZodType<Q, z.ZodAnyDef, ParsedUrlQuery>;
	params?: z.ZodType<P, z.ZodAnyDef, string[]>;
}

interface RequestData<B = never, Q = never, P = never> {
	body: B;
	query: Q;
	params: P;
}

type RouteHandler = (this: Koa.Context, ctx: Koa.Context, ...params: any[]) => any;
type HandlerResult =
	| { resBody: object | string | Buffer; resStatus?: number }
	| { resBody?: object | string | Buffer; resStatus: number };

function routeHandler<B = never, Q = never, P = never>(
	schemas: RequestSchemas<B, Q, P>,
	handler: (data: RequestData<B, Q, P>) => Promise<HandlerResult>
): RouteHandler {
	return async function (this: Koa.Context, ctx: Koa.Context, ...rawParams: string[]) {
		let data: RequestData<B, Q, P>;
		try {
			data = {
				body: schemas.body?.parse(ctx.request.body)!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
				query: schemas.query?.parse(ctx.query)!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
				params: schemas.params?.parse(rawParams.slice(0, -1))!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
			};
		} catch (err) {
			ctx.throw(400, err);
		}
		const { resBody, resStatus } = await handler(data);
		if (resBody === undefined && resStatus === undefined) {
			ctx.throw(500, new Error("atleast one of resBody or resStatus has to be set!"));
		}
		if (resBody) {
			ctx.body = resBody;
		}
		if (resStatus) {
			ctx.status = resStatus;
		}
	};
}

export { routeHandler };
