import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import * as z from "zod";

import { NameSchema } from "../lib/index";
import { routeHandler } from "../lib/middleware";

const app = new Koa();
const router = new Router({
	prefix: '/users'
});
router.get("/:id", routeHandler(
	{
		params: z.object({ id: z.string().regex(/^\d+$/, "must be a number").transform(id => Number(id)) }),
	},
	async ({ params }) => {
		return { resBody: { params } };
	}
));
router.post("/", bodyParser(), routeHandler(
	{ body: NameSchema, query: z.object({ debug: z.string().optional() }) },
	async ({ body, query }) => {
		if (query.debug) {
			return { resBody: `Hello ${body.first} ${body.middle ? body.middle + " " : ""}${body.last}!\n` };
		} else {
			return { resStatus: 204 };
		}
	}
));

app.use(router.routes());

app.listen(3000);
