"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <div className="flex justify-between items-center pt-20 md:pt-32 container mx-auto px-4 md:px-16">
      <div className="">
        <Link href="/">
          <Image
            className="cursor-pointer hidden lg:block"
            src="/assets/logos/logo.svg"
            width={150}
            height={150}
            alt="Randamu Logo"
          />
          <div className="lg:hidden justify-center items-center flex">
            <Image
              className="cursor-pointer "
              src="/assets/logos/logo.svg"
              width={150}
              height={150}
              alt="Randamu Logo"
            />
          </div>
        </Link>
      </div>
      <ConnectButton />
    </div>
  );
};

export default Header;
