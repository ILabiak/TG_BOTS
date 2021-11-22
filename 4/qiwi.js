//import axios from "axios";
const axios = require('axios');

module.exports = class QiwiBot {
  constructor(props) {
    this.props = props;
  }

  sendAuthenticatedRequest = async ({
    method = "POST",
    url,
    data = {},
    params = {}
  }) => {
    let { accessToken } = this.props;

    try {
      let { data: response } = await axios({
        method,
        url: `https://edge.qiwi.com${url}`,
        headers: {
          Authorization: "Bearer " + accessToken
        },
        data,
        params
      });

      return response;
    } catch (error) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        };
      } else if (error.request) {
        return error.request;
      }

      return error.message;
    }
  };

  searchCheckout = async params => {
    return await this.sendAuthenticatedRequest({
      method: "GET",
      url: `/checkout/api/bill/search`,
      params: params
    });
  };

  processCheckout = async data => {
    return await this.sendAuthenticatedRequest({
      method: "POST",
      url: `/checkout-api/invoice/pay/wallet`,
      data
    });
  };

  transactionInfo = async transactionId => {
    return await this.sendAuthenticatedRequest({
      method: "GET",
      url: `/payment-history/v2/transactions/${transactionId}`
    });
  };

  transactionsList = async () => {
    let { personId } = this.props;
    return await this.sendAuthenticatedRequest({
      method: "GET",
      url: `/payment-history/v2/persons/${personId}/payments?rows=25`
    });
  };

  accountInfo = async () => {
    return await this.sendAuthenticatedRequest({
      method: "GET",
      url: "/person-profile/v1/profile/current"
    });
  };

  balanceInfo = async () => {
    let { personId } = this.props;

    return await this.sendAuthenticatedRequest({
      method: "GET",
      url: `/funding-sources/v2/persons/${personId}/accounts`
    });
  };

  processPayment = async ({ pattern_id, data }) => {
    let response = await this.sendAuthenticatedRequest({
      url: `/sinap/api/v2/terms/${pattern_id}/payments`,
      data
    });

    let isPay = false;

    do {
      let { errorCode, error, status } = await this.transactionsInfo(
        response.transaction.id
      );

      if (Number(errorCode) !== 0) {
        throw new Error(error);
      }

      if (status !== "WAITING") {
        isPay = true;
      }
    } while (!isPay);

    return response;
  };

  receivePayment = async(paymentComment, sum) =>{
  let txsList = await this.transactionsList();
  let txArr = txsList.data
   for(let el of txArr){
      if(el.sum.amount == sum && el.comment.includes(paymentComment)){
          return 1;
      }
  }
  return 0; 
  }
}
