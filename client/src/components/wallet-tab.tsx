import React from "react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";

interface WalletTabProps {
  balance: number;
  transactions: Transaction[];
}

const WalletTab: React.FC<WalletTabProps> = ({ balance, transactions }) => {
  return (
    <div className="p-4">
      {/* Coin Balance Card */}
      <div className="bg-white rounded-lg shadow-elevation-1 overflow-hidden">
        <div className="p-5 bg-primary text-white text-center">
          <h2 className="text-lg font-medium mb-1">Your Coin Balance</h2>
          <div className="flex items-center justify-center">
            <span className="material-icons mr-2 text-secondary">monetization_on</span>
            <span className="text-3xl font-bold">{balance}</span>
          </div>
          <p className="text-sm mt-1 opacity-80">Keep providing feedback to earn more!</p>
        </div>
        
        <div className="p-4">
          
          <div>
            <h3 className="font-medium text-sm mb-2">REDEEM OPTIONS</h3>
            <div className="space-y-2">
              <div className="border border-neutral-200 rounded p-3 flex justify-between items-center hover:bg-neutral-50 cursor-pointer">
                <div>
                  <h4 className="font-medium">$5 Amazon Gift Card</h4>
                  <p className="text-xs text-neutral-500">Minimum 100 coins required</p>
                </div>
                <button 
                  className={`px-3 py-1 rounded text-sm ${
                    balance >= 100 
                      ? "bg-primary text-white" 
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                  disabled={balance < 100}
                >
                  Redeem
                </button>
              </div>
              <div className="border border-neutral-200 rounded p-3 flex justify-between items-center hover:bg-neutral-50 cursor-pointer">
                <div>
                  <h4 className="font-medium">$10 PayPal Credit</h4>
                  <p className="text-xs text-neutral-500">Minimum 200 coins required</p>
                </div>
                <button 
                  className={`px-3 py-1 rounded text-sm ${
                    balance >= 200 
                      ? "bg-primary text-white" 
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                  disabled={balance < 200}
                >
                  Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-neutral-500 mb-2">TRANSACTION HISTORY</h3>
        <div className="bg-white rounded shadow-elevation-1">
          <div className="divide-y divide-neutral-200">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary bg-opacity-10 flex items-center justify-center mr-3">
                      <span className="material-icons text-secondary text-sm">
                        {transaction.amount > 0 ? "add_circle" : "remove_circle"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{transaction.description}</h4>
                      <p className="text-xs text-neutral-500">
                        {format(new Date(transaction.timestamp), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-medium ${transaction.amount > 0 ? "text-secondary" : "text-error"}`}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount} coins
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTab;
