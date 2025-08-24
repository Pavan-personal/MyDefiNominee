"use client"
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnect = () => {

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button onClick={openConnectModal} type="button">
                                        <div className="text-black font-funnel-display items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-[20px] shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-2 lg:text-xl px-8 py-2">
                                            Connect Wallet
                                        </div>
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button onClick={openChainModal} className="text-black items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-[20px] shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-2 lg:text-xl px-8 py-2">
                                        Wrong network
                                    </button>
                                );
                            }
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};