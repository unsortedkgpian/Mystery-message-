import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodeUsername = decodeURIComponent(username);
        const usero = await UserModel.findOne({ username: decodeUsername });

        if (!usero) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const isCodeValid = usero.verifyCode === code;
        const isCodeNotExpired = new Date(usero.verifyCodeExpiry) > new Date(); // Assuming verifyCodeExpiry field

        if (isCodeNotExpired && isCodeValid) {
            usero.isVerified = true;
            await usero.save();
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully",
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Verification code has expired, please sign up again to get a new code",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification code",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying user", error);
        return Response.json(
            {
                success: false,
                message: "Error verifying user",
            },
            { status: 500 }
        );
    }
}
