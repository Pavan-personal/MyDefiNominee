import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black-pattern text-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          <div className="text-center md:text-left">
            <Image
              className="cursor-pointer"
              src="/assets/logos/lightLogo.svg"
              width={150}
              height={150}
              alt="Randamu Logo"
            />
            <p className="font-funnel-display text-gray-400 mb-2">Randamu</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://docs.randa.mu/"
              target="_blank"
              className="text-gray-400 hover:text-black transition-colors duration-300 font-funnel-display"
            >
              Documentation
            </a>
            <a
              href="https://github.com/randa-mu"
              target="_blank"
              className="text-gray-400 hover:text-black transition-colors duration-300 font-funnel-display"
            >
              GitHub
            </a>
            <a
              href="https://x.com/RandamuInc/"
              target="_blank"
              className="text-gray-400 hover:text-black transition-colors duration-300 font-funnel-display"
            >
              Twitter
            </a>
          </div>
        </div>
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800 text-center">
          <p className="font-funnel-display text-gray-400">
            Built with ❤️ by FIL-B
          </p>
        </div>
      </div>
    </footer>
  );
}
