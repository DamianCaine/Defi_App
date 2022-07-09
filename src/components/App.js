import React, { Component } from 'react'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import './App.css'
import Web3 from 'web3'
import Main from './Main'

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  //load blockchain data
  async loadBlockChainData() {
    const web3 = window.web3;

    //Load all the accounts from MetaMask
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]});
    
    //networkID
    const networkId = await web3.eth.net.getId()
    const daiTokenData = DaiToken.networks[networkId]
    const dappTokenData = DappToken.networks[networkId];
    const tokenFarmData = TokenFarm.networks[networkId];

    //Load DaiToken
    if(daiTokenData){
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString()})
      //console.log({balance: daiTokenBalance})
    }
    else{
      window.alert('DaiToken contract not deployed to detected network!')
    }

    //Load DappToken
    if(dappTokenData){
      const dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({dappToken})
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString()})
    }
    else{
      window.alert('DappToken contract not deployed to detected network!')
    }

    //Load TokenFarm
    if(tokenFarmData){
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({tokenFarm})
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString()})
    }
    else{
      window.alert('TokenFarm contract not deployed to detected network!')
    }

    this.setState({loading: false})
  }

  //load web3
  async loadWeb3() {
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-ethereum browser detected. Try using MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({from: this.state.account}).on('transactionHash', (hash) =>{
        this.setState({loading: false})
      })
    })
  }
 
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading){
      content = <p id='loader' className='text-center'>Loading...</p>
    }
    else{
      content= <Main
      daiTokenBalance = {this.state.daiTokenBalance}
      dappTokenBalance = {this.state.dappTokenBalance}
      stakingBalance = {this.state.stakingBalance}
      stakeTokens = {this.stakeTokens}
      //unstakeTokens = {this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
