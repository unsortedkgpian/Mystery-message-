import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { auth } from "@/auth";
import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET() {
	await dbConnect();
	const session = await auth();

	// const session = await getServerSession(authOptions);

	const user: User = session?.user as User;

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 401 }
		);
	}
	// const userId = user._id; this can create error
	const userId = new mongoose.Types.ObjectId(user._id);

	try {
		const user = await UserModel.aggregate([
			{ $match: { id: userId } },
			{ $unwind: "$messages" },
			{ $sort: { "messages.createdAt": -1 } },
			{ $group: { _id: "$_id", messages: { $push: "$messages" } } },
		]);

		if (!user || user.length === 0) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 401 }
			);
		}

		return Response.json(
			{
				success: true,
				messages: user[0].messages,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("An unexpected error occured: ", error);
		return Response.json(
			{
				success: false,
				message: "Not Authenticated",
			},
			{ status: 500 }
		);
	}
}
