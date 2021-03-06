import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import { Elements, StripeProvider } from "react-stripe-elements";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";


import "./Settings.css";
import BillingForm from "../components/BillingForm";
import config from "../config";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";


export default function Settings() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  

  useEffect(() => {
    setStripe(window.Stripe(config.STRIPE_KEY));
    
    Auth.currentUserInfo()
     .then(function(result) {
      setUserEmail(result.attributes.email)
    })
  }, []);

  function billUser(details) {
    return API.post("notes", "/billing", {
      body: details
    });
  }

  async function handleFormSubmit(storage, { token, error }) {
    if (error) {
      onError(error);
      return;
    }
  
    setIsLoading(true);
  
    try {
      await billUser({
        storage,
        source: token.id
      });
  
      alert("Your card has been charged successfully!");
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  return (
    <div className="Settings">
      <p> User: {userEmail} </p>
      <hr />
      <LinkContainer to="/settings/password">
        <LoaderButton block bsSize="large">
          Change Password
        </LoaderButton>
      </LinkContainer>
      <hr />
      <StripeProvider stripe={stripe}>
        <Elements>
          <BillingForm isLoading={isLoading} onSubmit={handleFormSubmit} />
        </Elements>
      </StripeProvider>
    </div>
  );
}