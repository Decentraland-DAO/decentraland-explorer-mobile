import { NFTInfo } from '../../api/nft/NFTInfo';
import EmoteCard from './EmoteCard';
import LandCard from './LandCard';
import NameCard from './NameCard';
import WearableCard from './WearableCard';

interface ContainerProps {
  nftInfo: NFTInfo
}

const NftInfoCard: React.FC<ContainerProps> = ({ nftInfo }) => {

  return (
    <>
      {nftInfo.nft.category === "wearable" &&
        <WearableCard item={nftInfo}></WearableCard>
      }
      {nftInfo.nft.category === "emote" &&
        <EmoteCard item={nftInfo}></EmoteCard>
      }
      {(nftInfo.nft.category === "estate" || nftInfo.nft.category === "parcel") &&
        <LandCard item={nftInfo}></LandCard>
      }
      {(nftInfo.nft.category === "ens") &&
        <NameCard item={nftInfo}></NameCard>
      }
    </>

  );
};

export default NftInfoCard;
