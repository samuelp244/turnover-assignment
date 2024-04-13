import nodemailer, { type Transporter } from "nodemailer";

interface MailSenderProps {
  email: string;
  title: string;
  body: string;
}
const mailSender = async ({ email, title, body }: MailSenderProps) => {
  try {
    // Create a Transporter to send emails
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST!,
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    });
    // Send emails to users
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const info: nodemailer.SentMessageInfo = await transporter.sendMail({
      from: "sam07 <connect@samuelpediredla.dev>",
      to: email,
      subject: title,
      html: body,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return info;
  } catch (error: any) {
    console.log(error);
  }
};

export default mailSender;
