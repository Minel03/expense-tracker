import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { addTransaction, updateTransaction, deleteTransaction, addSubscription, deleteSubscription, processSubscriptions } from '@/lib/transactions';
import { toast } from 'react-hot-toast';

export default function AIChat({ transactions, subscriptions, summary, userName, userId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${userName}! Ask me anything about your finances. For example, "How much did I spend on food this month?"` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages,
          transactions, 
          subscriptions,
          summary 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch response');
      
      if (data.tool_calls) {
        let actionMessage = "I have processed your request!";
        let needsSubscriptionProcess = false;
        let needsUIUpdate = false;

        for (const call of data.tool_calls) {
          const args = JSON.parse(call.function.arguments);
          
          if (call.function.name === 'add_transaction') {
            const { error } = await addTransaction({ ...args, user_id: userId });
            if (error) {
              toast.error("Failed to add transaction via AI.");
              actionMessage = "Sorry, I encountered an error saving that.";
            } else {
              toast.success("Transaction added via AI!");
              actionMessage = `I've added the ${args.type} of ₱${parseFloat(args.amount).toLocaleString()} for ${args.category}.`;
              needsUIUpdate = true;
            }
          } 
          else if (call.function.name === 'modify_transaction') {
            const { id, ...updates } = args;
            const { error } = await updateTransaction(id, updates);
            if (error) {
              toast.error("Failed to update transaction via AI.");
              actionMessage = "Sorry, I couldn't update that transaction.";
            } else {
              toast.success("Transaction updated via AI!");
              actionMessage = `I've successfully updated the transaction!`;
              needsUIUpdate = true;
            }
          }
          else if (call.function.name === 'delete_transaction') {
            const { error } = await deleteTransaction(args.id);
            if (error) {
              toast.error("Failed to delete transaction via AI.");
              actionMessage = "Sorry, I couldn't delete that transaction.";
            } else {
              toast.success("Transaction deleted via AI!");
              actionMessage = `I've successfully deleted the transaction!`;
              needsUIUpdate = true;
            }
          }
          else if (call.function.name === 'add_subscription') {
            const { error } = await addSubscription({ ...args, user_id: userId });
            if (error) {
              toast.error("Failed to add subscription via AI.");
              actionMessage = "Sorry, I couldn't create that subscription.";
            } else {
              needsSubscriptionProcess = true;
              toast.success("Subscription added via AI!");
              actionMessage = `I've added your ${args.name} subscription! It's set for ₱${parseFloat(args.amount).toLocaleString()} every month (day ${args.billing_day}).`;
              needsUIUpdate = true;
            }
          }
          else if (call.function.name === 'delete_subscription') {
            const { error } = await deleteSubscription(args.id);
            if (error) {
              toast.error("Failed to remove subscription via AI.");
              actionMessage = "Sorry, I couldn't delete that subscription.";
            } else {
              toast.success("Subscription removed via AI!");
              actionMessage = `I've successfully removed the subscription!`;
              needsUIUpdate = true;
            }
          }
        }

        // Run side-effects once after all tools are finished
        if (needsSubscriptionProcess) await processSubscriptions(userId);
        if (needsUIUpdate && onUpdate) onUpdate();

        setMessages(prev => [...prev, { role: 'assistant', content: actionMessage }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble analyzing your finances right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <FiMessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-full max-w-sm sm:max-w-md h-[500px] max-h-[80vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-violet-600 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-sm">FinAI Assistant</h3>
              <p className="text-[10px] text-violet-200">Powered by Groq</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-white/5 rounded-bl-sm'}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <FiLoader className="w-4 h-4 animate-spin text-violet-600" />
                <span className="text-xs text-neutral-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-white/10 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your expenses..."
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-neutral-900 rounded-full pl-4 pr-12 py-3 text-sm outline-none transition-all dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
