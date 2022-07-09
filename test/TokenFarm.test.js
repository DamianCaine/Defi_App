const { assert } = require('chai');

const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(web3.utils.toBN(n),'Ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () =>{
        //Load Contracts
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

        //Transfer all the Dapp Tokens to farm
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));

        //Transfer mDAI tokens to investor
        await daiToken.transfer(investor, tokens('100'), {from: owner});
    })

    describe('Mock Dai deployment', async () =>{
        it('Has a name', async () =>{
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI Token');
        }) 
    })

    describe('Dapp Tokens deployment', async () => {
        it('Has a name', async () => {
            const name = await dappToken.name();
            assert.equal(name, 'DApp Token');
        })
    })

    describe('Token Farm deployment', async () => {
        it('Has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp Token Farm');
        })

        it('contract has all the tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens(1000000));
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investor for staking mDai tokens', async () => {
            let result

            //checking investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'Investor mDAI wallet balance should correct before staking');

            //Stake mDAI
            await daiToken.approve(tokenFarm.address, tokens(100), {from:investor});
            await tokenFarm.stakeTokens(tokens(100), {from:investor});

            //checking stakes results
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(0), 'Investor mDAI wallet balance should correct after staking');

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens(100), 'Token farm mock DAI balance should correct after staking');

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens(100), 'Investor staking balance should correct after staking');

            result = await tokenFarm.stakingStatus(investor)
            assert.equal(result.toString(), 'true', 'Investor staking status should correct after staking');

            //Issue Tokens
            await tokenFarm.issueTokens({from: owner})

            //Check balance after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'Investor DApp wallet balance should be correct');

            //Ensuring that only owner is able to issue
            await tokenFarm.issueTokens({from:investor}).should.be.rejected;

            //Unstake the tokens
            await tokenFarm.unstakeTokens({from: investor})

            //checking investor balance after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'Investor mDAI wallet balance should correct after unstaking');

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens(0), 'Token farm mock DAI balance should correct after unstaking');

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens(0), 'Investor staking balance should correct after unstaking');

            result = await tokenFarm.stakingStatus(investor)
            assert.equal(result.toString(), 'false', 'Investor staking status should correct after unstaking');

        })
    })
})