import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (will be implemented later)
    console.log("Contact form submitted:", { name, email, message });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Message Sent!</CardTitle>
              <CardDescription>
                Thank you for contacting us. We'll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We typically respond to inquiries within 24-48 hours during
                business days.
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
            <p className="mb-6">
              Have questions about ColorMarket? We're here to help! Fill out the
              form and our team will get back to you as soon as possible.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Email</h3>
                <p>support@colormarket.example.com</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Office Hours</h3>
                <p>Monday - Friday: 9am - 5pm EST</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Follow Us</h3>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="text-primary hover:underline">
                    Twitter
                  </a>
                  <a href="#" className="text-primary hover:underline">
                    Instagram
                  </a>
                  <a href="#" className="text-primary hover:underline">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
