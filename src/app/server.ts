import Koa from "koa";
import Body from "koa-body";
import Route from "koa-route";
import * as z from "zod";

import { NameSchema } from "../lib/index";
import { routeHandler } from "../lib/middleware";

const app = new Koa();
app.use(Body());

app.use(
	Route.get("/user/:id")(
		routeHandler(
			{
				params: z
					.string()
					.array()
					.length(1)
					.transform(([id]) => ({ id: Number(id) })),
			},
			async ({ params }) => {
				return { resBody: { params } };
			}
		)
	)
);

app.use(
	Route.post("/user")(
		routeHandler(
			{ body: NameSchema, query: z.object({ debug: z.string().optional() }), params: z.string().array().length(0) },
			async ({ body, query }) => {
				if (query.debug) {
					return { resBody: `Hello ${body.first} ${body.middle ? body.middle + " " : ""}${body.last}!\n` };
				} else {
					return { resStatus: 204 };
				}
			}
		)
	)
);

app.listen(3000);
