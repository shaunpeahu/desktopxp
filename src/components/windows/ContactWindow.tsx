import React, { useMemo, useState } from "react";

interface ContactWindowProps {
  data: {
    email: string;
    location: string;
  };
}

export const ContactWindow: React.FC<ContactWindowProps> = ({ data }) => {
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const to = data.email || "shaun@peahu.com";

    // Mailto supports subject/body; "from" can't be enforced (email client controls it),
    // but we can include it at the top of the body.
    const finalSubject = subject.trim() || "Message from shaun.peahu.com";
    const bodyLines = [
      fromEmail.trim() ? `From: ${fromEmail.trim()}` : "From:",
      "",
      message || "",
      "",
      `--`,
      `Sent via shaun.peahu.com`,
    ];

    const params = new URLSearchParams({
      subject: finalSubject,
      body: bodyLines.join("\n"),
    });

    return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
  }, [data.email, fromEmail, subject, message]);

  const canSend = (message.trim().length > 0);

  return (
    <div className="font-tahoma text-[11px] sm:text-[12px] text-black">
      {/* Toolbar-like row */}
      <div className="flex items-center gap-2 border-b border-[#D4D0C8] pb-2 mb-3">
        <button
          className={`px-3 py-1 rounded-[3px] border border-[#ACA899] bg-[#ECE9D8] shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] ${
            canSend ? "hover:brightness-105" : "opacity-60 cursor-not-allowed"
          }`}
          disabled={!canSend}
          onClick={() => {
            if (!canSend) return;
            window.location.href = mailtoHref;
          }}
          title="Opens your email app"
        >
          Send Message
        </button>

        <a
          href={mailtoHref}
          className={`px-3 py-1 rounded-[3px] border border-[#ACA899] bg-[#ECE9D8] shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] ${
            canSend ? "hover:brightness-105" : "opacity-60 pointer-events-none"
          }`}
          title="Compose in your email client"
        >
          New Message
        </a>

        <div className="h-6 w-px bg-[#D4D0C8] mx-1" />

        <a
          href={`mailto:${data.email}`}
          className="px-3 py-1 rounded-[3px] border border-[#ACA899] bg-[#ECE9D8] shadow-[inset_1px_1px_0_rgba(255,255,255,0.8)] hover:brightness-105"
          title="Email directly"
        >
          Email
        </a>

        <div className="ml-auto text-[10px] text-gray-700">
          {data.location}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-14 text-right pr-1">To:</div>
          <input
            value={data.email}
            readOnly
            className="flex-1 h-7 px-2 border border-[#7F9DB9] bg-white shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-14 text-right pr-1">From:</div>
          <input
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="your email address"
            className="flex-1 h-7 px-2 border border-[#7F9DB9] bg-white shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-14 text-right pr-1">Subject:</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="subject of your message"
            className="flex-1 h-7 px-2 border border-[#7F9DB9] bg-white shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]"
            autoComplete="on"
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
          />
        </div>

        <div className="border border-[#7F9DB9] bg-white shadow-[inset_1px_1px_0_rgba(0,0,0,0.06)]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here"
            className="w-full h-[220px] p-2 outline-none resize-none"
            spellCheck={true}
            autoCorrect="on"
            autoCapitalize="sentences"
            autoComplete="on"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-600">
          <div>
            Spellcheck uses the browser’s dictionary. Autocorrect depends on the user’s OS/browser settings.
          </div>
          <div>
            {message.trim().length} chars
          </div>
        </div>
      </div>
    </div>
  );
};
