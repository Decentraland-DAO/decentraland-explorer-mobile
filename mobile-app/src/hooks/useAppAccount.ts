import { useAccount } from "@web3modal/react"
import { useEffect, useState } from "react";
import { AppAccount } from "../models/AppAccount";
import { AppReviewService } from "../services/AppReviewService"
import { SharedState } from "../services/SharedState";

export function useAppAccount() {
    const { account } = useAccount();
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState("");
    const [isInDemoMode, setIsInDemoMode] = useState(false);
    const sharedState = SharedState.getInstance();

    useEffect(() => {
        checkDemoMode();
        AppReviewService.getInstance().subscribe(() => {
            checkDemoMode();
        });

        sharedState.subscribe("dcl-account", (key: string, value: AppAccount) => {
            setAddress(value.address);
            setIsConnected(value.isConnected);
        });
    }, []);

    const checkDemoMode = async () => {
        const appReviewService = AppReviewService.getInstance();
        const config = appReviewService.getReviewConfig();
        if (config) {
            setIsInDemoMode(config.demoWallet);
        }
    }

    useEffect(() => {
        if (!isInDemoMode) {
            if (account.isConnected) {
                sharedState.setValue("dcl-account", {
                    isConnected: true,
                    address: account.address,
                });
            }
            else {
                sharedState.setValue("dcl-account", {
                    isConnected: false,
                    address: "",
                });
            }
        }
    }, [account.isConnected]);

    const demoSignIn = async () => {
        const appReviewService = AppReviewService.getInstance();
        sharedState.setValue("dcl-account", {
            isConnected: true,
            address: appReviewService.getReviewConfig().walletAddress,
        });
    }

    const demoSignOut = () => {
        sharedState.setValue("dcl-account", {
            isConnected: false,
            address: "",
        });
    }

    return {
        appAccount: {
            isConnected, address, isInDemoMode, demoSignIn, demoSignOut
        }
    };
}
