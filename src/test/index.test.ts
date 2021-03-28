import { test } from "tap";
import * as z from "zod";
import { PersonSchema, LottoSchema, IsoDateSchema, TheAnswerSchema } from "../lib/index";

const personRawMin: z.input<typeof PersonSchema> = {
	id: "affeaffe-affe-4ffe-affe-affeaffeaffe",
	name: {
		first: "Firstname",
		last: "Lastname",
	},
	address: {
		streetAddress: "Kurze Mühren 1",
		zipCode: "20095",
		city: "Hamburg",
	},
	gender: "male",
	email: "first.last@mobimeo.com",
	birthDate: null,
};

const personRawMax: z.input<typeof PersonSchema> = {
	id: "affeaffe-affe-4ffe-affe-affeaffeaffe",
	name: {
		first: "Firstname",
		middle: "Unknown",
		last: "Lastname",
	},
	address: {
		streetAddress: "Kurze Mühren 1",
		zipCode: "20095",
		city: "Hamburg",
		country: "Germany",
		location: { latitude: 10, longitude: 51 },
	},
	gender: "male",
	email: "first.last@mobimeo.com",
	birthDate: "1970-01-01",
	interests: ["Werder"],
	lottoNumbers: [1, 2, 3, 47, 48, 49],
	theAnswer: 42,
};

test("PersonSchema:parses_valid_data", async (tap) => {
	PersonSchema.parse(personRawMin);
	tap.pass("can parse a minimal person object!");
	PersonSchema.parse(personRawMax);
	tap.pass("can parse a maximal version object!");
});

test("IsoDateSchema:parses_and_transforms_valid_data", async (tap) => {
	const date = IsoDateSchema.parse("1970-01-01");
	tap.looseEqual(date, new Date("1970-01-01"));
	try {
		IsoDateSchema.parse("NOT_A_DATE");
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"not an ISO date!"/u);
	}
});

test("LottoSchema:parses_valid_data", async (tap) => {
	const lotto = LottoSchema.parse([1, 2, 3, 47, 48, 49]);
	tap.deepEqual(lotto, [1, 2, 3, 47, 48, 49]);
	try {
		LottoSchema.parse([0, 2, 3, 47, 48, 49]);
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"Value should be greater than or equal to 1"/u);
	}
	try {
		LottoSchema.parse([1, 2, 3, 50, 48, 49]);
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"Value should be less than or equal to 49"/u);
	}
	try {
		LottoSchema.parse([1.1, 2, 3, 47, 48, 49]);
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"Expected integer, received float"/u);
	}
	try {
		LottoSchema.parse("INVALID");
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"Expected array, received string"/u);
	}
});

test("LottoSchema:parses_valid_data", async (tap) => {
	const answer = TheAnswerSchema.parse(42);
	tap.equal(answer, 42);
	try {
		TheAnswerSchema.parse(23);
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"iff given it must be the answer!"/u);
	}
	try {
		TheAnswerSchema.parse(-42);
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"iff given it must be the answer!"/u);
	}
	try {
		TheAnswerSchema.parse("42");
		tap.fail();
	} catch (err) {
		tap.like(err.message, /"Expected number, received string"/u);
	}
});
