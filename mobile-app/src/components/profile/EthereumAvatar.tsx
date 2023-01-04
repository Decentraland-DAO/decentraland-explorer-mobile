import { createIcon } from "@download/blockies";
import React, { useEffect, useRef } from "react";
import "./EthereumAvatar.css";

interface ContainerProps {
    address: string;
}

const EthereumAvatar: React.FC<ContainerProps> = ({ address }) => {

    const containerEl = useRef(null);

    useEffect(() => {
        var icon = createIcon({
            seed: address,
            color: '#d63370',
            bgcolor: '#3149de',
            size: 10,
            scale: 5 
        });
        (containerEl.current as any).appendChild(icon);
    }, [address]);
    
    return (
        <div className="ethereum-avatar" ref={containerEl}></div>
    );
};

export default EthereumAvatar;
