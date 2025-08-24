import Header from "../components/header";
import { WalletConnect } from "@/components/walletConnect";
export default function Wallet() {

  return (
    <div className="w-full min-h-screen bg-blue-pattern text-white">

      <Header />
      <div >
        <div
          className="relative w-full pt-48 pb-40 m-auto flex justify-center text-center flex-col items-center z-1 text-white"
          style={{ maxWidth: "1200px" }}
        >
          <h1 className="font-funnel-display inline-block max-w-2xl lg:max-w-4xl  w-auto relative text-5xl md:text-6xl lg:text-7xl tracking-tighter mb-10 font-bold">
            Blocklock Encryption{" "}
          </h1>
          <p className="font-funnel-display text-xl mb-5">
            Securely encrypt your data until a designated time
          </p>
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
