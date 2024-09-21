import React, { useEffect } from 'react';
import { ethers } from 'ethers';

interface ConnectWalletProps {
  account: string;
  setAccount: React.Dispatch<React.SetStateAction<string>>;
  setSigner: React.Dispatch<React.SetStateAction<ethers.Signer | null>>;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ account, setAccount, setSigner }) => {
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    try {
      const provider = window.ethereum;

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      setSigner(signer);

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      } else {
        console.error(error);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setSigner(null); 
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);

          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = ethersProvider.getSigner();
          setSigner(signer);
        }
      });
    } else {
      console.log('Please install MetaMask');
    }
  }, [setAccount, setSigner]);

  return (
    <div className="text-right">
      {account ? (
        <div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      )}
    </div>
  );
};
