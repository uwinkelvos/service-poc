import * as z from "zod";

const NameSchema = z.object({
	first: z.string(),
	middle: z.string().optional(),
	last: z.string(),
});
const LocationSchema = z.object({ latitude: z.number(), longitude: z.number() });
const AddressSchema = z.object({
	streetAddress: z.string().regex(/^(?<street>.+?)\s+(?<houseNumber>\d+[a-zA-Z\-]*)$/u),
	zipCode: z.string().length(5),
	city: z.string(),
	country: z.string().optional(),
	location: LocationSchema.optional(),
});
const IsoDateSchema = z
	.string()
	.regex(/\d{4}-\d{2}-\d{2}/u, "not an ISO date!")
	.transform((val) => new Date(val));
const LottoSchema = z.number().int().min(1).max(49).array().length(6);
const TheAnswerSchema = z.number().refine((val) => val === 42, { message: "iff given it must be the answer!" });
const PersonSchema = z.object({
	id: z.string().uuid(),
	name: NameSchema,
	address: AddressSchema,
	gender: z.enum(["female", "male", "diverse"]),
	email: z.string().email(),
	birthDate: IsoDateSchema.nullable(),
	interests: z.string().array().optional(),
	lottoNumbers: LottoSchema.optional(),
	theAnswer: TheAnswerSchema.optional(),
});

export { NameSchema, LocationSchema, AddressSchema, IsoDateSchema, LottoSchema, TheAnswerSchema, PersonSchema };
