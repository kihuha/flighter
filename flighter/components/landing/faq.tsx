import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "How do I book a flight?",
      answer:
        "To book a flight, simply use our search tool to find available flights, select your preferred option, and follow the prompts to complete your booking.",
    },
    {
      question: "Can I change or cancel my booking?",
      answer:
        "Yes, you can change or cancel your booking depending on the fare rules associated with your ticket. Please refer to our cancellation and change policy for more details.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including credit/debit cards, PayPal, and other online payment options.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our customer support team via email, phone, or live chat on our website. We are here to assist you with any inquiries or issues you may have.",
    },
  ];
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

      <Accordion
        type="single"
        collapsible
        defaultValue="shipping"
        className="max-w-lg mx-auto md:max-w-7xl"
      >
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
