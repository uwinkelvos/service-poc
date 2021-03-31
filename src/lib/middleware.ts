import * as z from "zod";
import * as Koa from "koa";
import { Middleware } from "@koa/router";
import { ParsedUrlQuery } from "querystring";

interface RequestSchemas<B = never, Q = never, P = never> {
	body?: z.ZodType<B, z.ZodAnyDef, unknown>;
	query?: z.ZodType<Q, z.ZodAnyDef, ParsedUrlQuery>;
	params?: z.ZodType<P, z.ZodAnyDef, unknown>;
}

interface RequestData<B = never, Q = never, P = never> {
	body: B;
	query: Q;
	params: P;
}

type HandlerResult =
	| { resBody: object | string | Buffer; resStatus?: number }
	| { resBody?: object | string | Buffer; resStatus: number };

function routeHandler<B = never, Q = never, P = never>(
	schemas: RequestSchemas<B, Q, P>,
	handler: (data: RequestData<B, Q, P>) => Promise<HandlerResult>
): Middleware {
	return async function (ctx: Koa.Context) {
		let data: RequestData<B, Q, P>;
		try {
			data = {
				body: schemas.body?.parse(ctx.request.body)!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
				query: schemas.query?.parse(ctx.query)!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
				params: schemas.params?.parse(ctx.params)!, // TODO: can these assertions ! be replaced by proper typing? generic defaults?
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
