// yarn hardhat deploy --network base --tags CumulativeMerkleDrop
import { deployAndGetContract } from '@1inch/solidity-utils';

interface OneInchAddress {
    networkId: number;
    addr: string;
}

const oneInchAddresses: OneInchAddress[] = [
    {
        networkId: 8453, // base
        addr: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    },
];

module.exports = async ({ deployments, getNamedAccounts }) => {
    const hre = require('hardhat');
    const { getChainId } = hre;
    const chainId = await getChainId();
    
    console.log('running deploy script');
    console.log('network id ', chainId);

    const rewardToken = oneInchAddresses.find((token) => token.networkId == chainId); // eslint-disable-line eqeqeq

    if (rewardToken === undefined || rewardToken.addr === undefined) {
        console.log('No reward token mapped for the chain', chainId);
        return;
    }
    console.log('reward token address', rewardToken.addr);

    const { deployer } = await getNamedAccounts();

    // Token address for constructor
    const args: string[] = [rewardToken.addr];
    
    // Merkle root - Must be replaced with real value before deployment
    const merkleRoot = 'merkle root';
    
    // Gas settings optimized for Base network
    // Base typically uses EIP-1559, adjust these values based on current network conditions
    const maxFeePerGas = 1e11; // 100 gwei
    const maxPriorityFeePerGas = 2e9; // 2 gwei

    const cumulativeMerkleDrop = await deployAndGetContract({
        contractName: 'CumulativeMerkleDrop',
        constructorArgs: args,
        deployments,
        deployer,
    });

    // Only set merkle root if it's not the placeholder
    if (merkleRoot !== 'merkle root') {
        const txn = await cumulativeMerkleDrop.setMerkleRoot(
            merkleRoot,
            {
                maxFeePerGas,
                maxPriorityFeePerGas,
            },
        );
        await txn.wait();
        console.log('Merkle root set to:', merkleRoot);
    } else {
        console.log('WARNING: Merkle root not set. Please set it manually after deployment.');
    }

    console.log('CumulativeMerkleDrop deployed to:', await cumulativeMerkleDrop.getAddress());
};

module.exports.skip = async () => false;
module.exports.tags = ['CumulativeMerkleDrop'];
