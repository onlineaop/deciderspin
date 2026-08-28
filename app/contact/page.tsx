import { buildMetadata } from "@/lib/site";
import ContactForm from "@/components/ContactForm";

export const metadata = buildMetadata({
  title: "Contact Us — DeciderSpin",
  description: "Get in touch with the DeciderSpin team.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-16 flex flex-col gap-8 items-start">
      <h1 className="text-4xl md:text-5xl font-extrabold">Contact Us</h1>
      <ContactForm />
    </div>
  );
}
