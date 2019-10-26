import React from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import Alert from 'react-bootstrap/Alert'

/**
 * note: make axios process cross origin
 */
axios.interceptors.response.use(function (response) {
  return response.data;//extract data
}, function (error) {
  return Promise.reject(error);
})

const joinPath = (...paths) => paths.map(it=> it.replace(/^\/|\/$/g, '')).join('/')

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {base_url: '',
      consumer_key: '',
      username: '',
      password: '',
      token: '',
      banks: [],
      accounts: [],
      error: null
    }
  }

  base_url_onchange = e => {
    e.preventDefault();
    this.setState({"base_url": e.target.value})
  }
  consumer_key_onchange = e => {
    e.preventDefault();
    this.setState({"consumer_key": e.target.value})
  }
  username_onchange = e => {
    e.preventDefault();
    this.setState({"username": e.target.value})
  }
  password_onchange = e => {
    e.preventDefault();
    this.setState({"password": e.target.value})
  }
  error_handler = e => {
    if (e.response && e.response.data && e.response.data.message) {
      this.setState({'error': e.response.data.message})
    } else if (e.response) {
      this.setState({'error': e.response})
    } else {
      this.setState({'error': e})
    }
  }

  fetch_direct_login_token = ()=>{
    const {base_url, consumer_key, username, password} = this.state
    const url =  joinPath(base_url, '/my/logins/direct')
    axios({
      url,
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DirectLogin username="${username}",password="${password}",consumer_key="${consumer_key}"`
      }
    }).then(result => {
      this.setState({'token': result.token, 'error': null});
    }).catch(this.error_handler)
  }

  clear_token = ()=> this.setState({'token': ''})

  fetch_banks = ()=> {
    const {base_url, token} = this.state
    const url = joinPath(base_url, '/obp/v4.0.0/banks')
    axios({
      url,
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DirectLogin token="${token}"`
      }
    }).then(result => {
      this.setState({'banks': result.banks, 'error': null});
    }).catch(this.error_handler)
  }

  fetch_accounts = () => {
    const {base_url, token} = this.state
    const url = joinPath(base_url, `/obp/v4.0.0/my/accounts`)
    axios({
      url,
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DirectLogin token="${token}"`
      }
    }).then(result => {
      this.setState({'accounts': result.accounts, 'error': null});
    }).catch(this.error_handler)
  }

  render() {
    return (
        <div>
          {
            this.state.token ?
                <div>
                  <p>DirectLoginToken: {this.state.token}<br/>
                   All the follow http request will have the follow headers: <br/>
                    <code>
                      {
                        `
                        headers: {
                        'Content-Type': 'application/json',
                        'Authorization': DirectLogin token="${this.state.token}"
                        }
                        `
                      }
                    </code>
                  </p>
                  <div>
                    <button type="button" onClick={this.fetch_banks}>Get Banks</button> <button type="button" onClick={this.clear_token}>Reset Token</button> <br/>
                    banks:
                    <ul>
                      { this.state.banks.length ?
                        this.state.banks.map(bank => (<li key={bank.id}>{bank.short_name}</li>)) :
                        <li>no banks</li>
                      }
                    </ul>
                  </div>
                  <div>
                    <button type="button" onClick={this.fetch_accounts}>Get Accounts</button> <br/>
                    accounts:
                    <ul>
                      {
                        this.state.accounts.length ?
                        this.state.accounts.map(account => (<li key={account.id}>{account.label}</li>)) :
                        <li>no accounts</li>
                      }
                    </ul>
                  </div>
                </div>
                :
                <div>
                  <h1>get direct login token</h1>
                  <label htmlFor="base_url">obp api base url: </label>
                  <input id="base_url" type="text" value={this.state.base_url} onChange={this.base_url_onchange}/> <br/>
                  <label htmlFor="consumer_key">consumer key: </label>
                  <input id="consumer_key" type="text" value={this.state.consumer_key}
                         onChange={this.consumer_key_onchange}/> <br/>
                  <label htmlFor="username">username:</label>
                  <input id="username" type="text" value={this.state.username} onChange={this.username_onchange}/> <br/>
                  <label htmlFor="password">password: </label>
                  <input id="password" type="password" value={this.state.password} onChange={this.password_onchange}/>
                  <br/>
                  <button type="button" onClick={this.fetch_direct_login_token}>get Token</button>
                </div>
          }
          {
            this.state.error ? <Alert variant='danger'> {this.state.error} </Alert> : ''
          }
        </div>
    );
  }
}

export default App;
