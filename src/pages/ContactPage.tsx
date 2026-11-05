import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { showToast } = useNotifications();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    showToast('Your message has been received by our support team', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Contact Support & Store Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A8B8] max-w-md mx-auto">
            Have questions about price accuracy, store integrations, or feedback? Reach out to our engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
              <Mail className="w-6 h-6 text-[#FFD43B] mb-2" />
              <h3 className="text-sm font-bold text-white">Email Inquiries</h3>
              <p className="text-xs text-[#A0A8B8] mt-1">support@pricetrack.com</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Average response under 4 hours</p>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
              <MessageSquare className="w-6 h-6 text-[#4F8CFF] mb-2" />
              <h3 className="text-sm font-bold text-white">Retailer Integration Feeds</h3>
              <p className="text-xs text-[#A0A8B8] mt-1">partners@pricetrack.com</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">For e-commerce adapter connections</p>
            </div>

            <div className="bg-[#141821] border border-[#1C2230] rounded-2xl p-6">
              <MapPin className="w-6 h-6 text-[#22C55E] mb-2" />
              <h3 className="text-sm font-bold text-white">Operations Center</h3>
              <p className="text-xs text-[#A0A8B8] mt-1">Bengaluru Tech Park, Karnataka, India</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Standard IST business hours</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-[#141821] border border-[#1C2230] rounded-3xl p-6 sm:p-8">
            {isSent ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#22C55E] mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Dispatched!</h3>
                <p className="text-xs text-[#A0A8B8] max-w-sm mx-auto">
                  Thank you for contacting PriceTrack. Our technical support engineers will respond to {email} shortly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1C2230] hover:bg-[#283248] text-white border border-[#283042] cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Patel"
                      required
                      className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Price discrepancy report or store listing inquiry"
                    required
                    className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A8B8] mb-1.5">Message</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about the product, URL, or inquiry..."
                    required
                    className="w-full bg-[#0B0D12] border border-[#283042] rounded-xl p-4 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FFD43B]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-[#FFD43B] hover:bg-[#ffe066] text-black shadow-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
