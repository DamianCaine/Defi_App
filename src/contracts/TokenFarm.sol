pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{

    string public name= "Dapp Token Farm";
    DaiToken public daiToken;
    DappToken public dappToken;
    address public owner;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public stakingStatus;

    constructor(DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    modifier onlyOwner{
        require(msg.sender == owner, 'Unauthorized user!');
        _;        
    }

    //Stake tokens(deposit)
    function stakeTokens(uint256 _amount) public{
        require(_amount > 0, 'Amount to be staked cannot be 0!');

        //transferring mock DAI tokens to token farm for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //updating staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + (_amount);

        //updating staking status
        stakingStatus[msg.sender] = true;
        addStaker(msg.sender);
    }

    //adding stakers in array
    function addStaker(address _investor) private {
        require(stakingStatus[_investor], "Investor is not a staker!");
        stakers.push(_investor);
    }

    //Unstaking tokens(withdraw) 
    function unstakeTokens() public{
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, 'Staking balance cannot be 0');

        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        stakingStatus[msg.sender] = false;
    }
    

    //Issuing tokens
    function issueTokens() public onlyOwner{
        for(uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance>0){
                dappToken.transfer(recipient, balance);
            }  
        }
    }

}