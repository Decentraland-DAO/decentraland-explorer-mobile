import fetch from 'cross-fetch';
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

const NAME = 'snapshot';
const VERSION = '0.1.4';

export const SnapshotDomain = {
    name: NAME,
    version: VERSION
};

export class SnapshotClient {
    readonly address: string;

    constructor(address: string) {
        this.address = address;
    }

    getDomain() {
        return {
            name: NAME,
            version: VERSION
        };
    }

    getTypes(){
        return vote2Types;
    }

    async send(envelop: any) {
        const url = `${this.address}/api/msg`;
        const init = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(envelop)
        };
        return new Promise((resolve, reject) => {
            fetch(url, init)
                .then((res) => {
                    if (res.ok) return resolve(res.json());
                    throw res;
                })
                .catch((e) => e.json().then((json: any) => reject(json)));
        });
    }

    async prepareVoteMessage(web3: Web3Provider | Wallet, address: string, message: any) {
        const isShutter = message?.privacy === 'shutter';
        if (!message.reason) message.reason = '';
        if (!message.app) message.app = '';
        const type2 = message.proposal.startsWith('0x');
        let type = type2 ? vote2Types : voteTypes;
        if (['approval', 'ranked-choice'].includes(message.type))
            type = type2 ? voteArray2Types : voteArrayTypes;
        if (!isShutter && ['quadratic', 'weighted'].includes(message.type)) {
            type = type2 ? voteString2Types : voteStringTypes;
            message.choice = JSON.stringify(message.choice);
        }
        if (isShutter) type = type2 ? voteString2Types : voteStringTypes;
        delete message.privacy;
        delete message.type;

        if (!message.from) message.from = address;
        if (!message.timestamp)
            message.timestamp = parseInt((Date.now() / 1e3).toFixed());

        const data: any = { domain: SnapshotDomain, types: type, message };

        return data;
    }
}

export const voteTypes = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'string' },
      { name: 'choice', type: 'uint32' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
  
  export const voteArrayTypes = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'string' },
      { name: 'choice', type: 'uint32[]' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
  
  export const voteStringTypes = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'string' },
      { name: 'choice', type: 'string' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
  
  export const vote2Types = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'bytes32' },
      { name: 'choice', type: 'uint32' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
  
  export const voteArray2Types = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'bytes32' },
      { name: 'choice', type: 'uint32[]' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
  
  export const voteString2Types = {
    Vote: [
      { name: 'from', type: 'address' },
      { name: 'space', type: 'string' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'proposal', type: 'bytes32' },
      { name: 'choice', type: 'string' },
      { name: 'reason', type: 'string' },
      { name: 'app', type: 'string' }
    ]
  };
