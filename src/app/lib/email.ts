import { CourierClient } from "@trycourier/courier";

const courier = new CourierClient({ authorizationToken: process.env.COURIER_API_KEY });

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        const { requestId } = await courier.send({
            message: {
                to: { email: to },
                content: {
                    title: subject,
                    body: html,
                },
                routing: {
                    method: "single",
                    channels: ["email"],
                },
            },
        });

        console.log(`Email sent via Courier, request ID: ${requestId}`);
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        return false;
    }
}
