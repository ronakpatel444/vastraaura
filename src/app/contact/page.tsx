export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-serif text-center mb-12">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-serif mb-6">Get in Touch</h2>
            <p className="opacity-70 mb-8 leading-relaxed text-sm">
              Whether you have a question about our collections, need styling advice, or require assistance with an existing order, our dedicated team is here to help.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h3>
                <a href="mailto:hello@vastraaura.com" className="opacity-70 hover:opacity-100 transition-opacity">hello@vastraaura.com</a>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Phone</h3>
                <p className="opacity-70">+91 98765 43210 <br/> (Mon-Sat, 10am to 7pm IST)</p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Flagship Studio</h3>
                <p className="opacity-70 leading-relaxed">
                  183 - Vijay Nagar, Yogi Chowk, <br/>
                  Surat, Gujarat, India
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-foreground/5 p-8 rounded-lg">
            <h2 className="text-xl font-serif mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block">Name</label>
                <input type="text" className="w-full bg-transparent border-b border-foreground/20 py-2 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block">Email</label>
                <input type="email" className="w-full bg-transparent border-b border-foreground/20 py-2 focus:outline-none focus:border-foreground transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest opacity-60 mb-2 block">Message</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-foreground/20 py-2 focus:outline-none focus:border-foreground transition-colors resize-none" />
              </div>
              <button type="button" className="w-full bg-foreground text-background py-4 text-sm uppercase tracking-widest hover:bg-accent transition-colors mt-6">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
