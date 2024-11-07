import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
	content: string;
	createdAt: Date;
}

const messageSchema: Schema<Message> = new Schema({
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
});

export interface User extends Document {
	username: string;
	email: string;
	password: string;
	verifyCode: string;
	verifyCodeExpiry: Date;
	isVerified: boolean;
	isAcceptingMessage: boolean;
	messages: Message[];
}

const userSchema: Schema<User> = new Schema({
	username: {
		type: String,
		required: [true, "Username is required"],
		trim: true,
		unique: true,
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		trim: true,
		unique: true,
		match: [
			/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
			"Please use a valid email address",
		],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	verifyCode: {
		type: String,
		required: [true, "verifyCode is required"],
	},
	verifyCodeExpiry: {
		type: Date,
		required: [true, "VerifyCode Expiry code  is required"],
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	isAcceptingMessage: {
		type: Boolean,
		default: true,
	},
	messages: [messageSchema],
});

const UserModel =
	(mongoose.models.User as mongoose.Model<User>) ||
	mongoose.model<User>("User", userSchema);

export default UserModel;
