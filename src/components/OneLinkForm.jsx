import React, { useState } from "react"
import styled from "styled-components"
import querystring from "query-string"
import { ToggleButtonGroup, ToggleButton, Typography, Select } from "@appsflyer/fe-ui-core"
import FormLabel from "@material-ui/core/FormLabel"
import Button from "@material-ui/core/Button"
import { makeStyles } from "@material-ui/core/styles"
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import axios from 'axios';

import { ToggleBanana, TogglePeach, ToggleApple } from "./svg-components"
import { gaTag } from "../utilities/analytics"

const Wrapper = styled.div`
  background: #ffffff;

  border: 1px solid #e5e8ed;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 24px;
`

const StyledTooltip = styled(Tooltip)`
  display: none;

  @media only screen and (min-width: 768px) {
    display: inline-block;
  }
`

const useStyles = makeStyles((theme) => ({
  innerForm: {
    marginBottom: "14px",
  },
  outerForm: {
    marginBottom: "24px",
  },
  paddingLeft: {
    paddingLeft: "4px",
  },
  helpIcon: {
    color: theme.palette.grey[500],
    '&:hover': {
      color: theme.palette.grey[600]
    }
  },
}))

export default function OneLinkForm({
  selectedPage,
  setSelectedPage,
  fruitAmount,
  setFruitAmount,
  iOSRedirect,
  setIOSRedirect,
  androidRedirect,
  setAndroidRedirect,
  webRedirect,
  setWebRedirect,
  setOneLinkURL,
  setShortLinkURL,
  setBrandedLinkURL,
  qrCodeRef,
  deepLinkState,
}) {
  const [shortLinkID, setShortLinkID] = useState("")

  const generateLinks = async () => {
    generateURL()
    generateShortURL()
  }

  const generateURL = async () => {
    let url = "https://onelink-sim.onelink.me/coiD"
    let pid = "QR_code"

    if (!deepLinkState) {
      url = "https://onelink-sim.onelink.me/P3Ik"
      pid = "QR_code_broken"
    }

    const params = {
      deep_link_value: selectedPage || undefined,
      deep_link_sub1: fruitAmount?.value || undefined,
      af_ios_url:
        iOSRedirect.label === "Web Page" ? iOSRedirect.value : undefined,
      af_android_url:
        androidRedirect.label === "Web Page"
          ? androidRedirect.value
          : undefined,
      af_web_dp: webRedirect.value || undefined,
    }

    const query = querystring.stringify(params)
    const finalURL = `${url}?pid=${pid}&${query}`

    await setOneLinkURL(finalURL)
    const isMobile = window.innerWidth < 768

    if (isMobile) {
      qrCodeRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    gaTag.event({
      category: 'User',
      action: 'Link Generated',
      label: selectedPage,
      value: parseInt(fruitAmount.value)
    });
  }

  const generateShortURL = async () => {    
    const options = {
      data: JSON.stringify({
        // 'brand_domain': "killtest.cache.afsdktests.com",
        'ttl': '1d',
        'data': {
          pid: 'my_media_source_SMS', 
          c: 'my_campaign_Michael',
          deep_link_value: selectedPage || undefined,
          deep_link_sub1: fruitAmount?.value || undefined,
          af_ios_url: iOSRedirect.label === "Web Page" ? iOSRedirect.value : undefined,
          af_android_url: androidRedirect.label === "Web Page" ? androidRedirect.value : undefined,
          af_web_dp: webRedirect.value || undefined,
        }
      }),
      shortLinkID: shortLinkID,
      oneLinkID: "coiD",
    }

    const endpoint = "https://onelinkapi.chayev.com/links" //UPDATE THIS!

    axios.post(endpoint, JSON.stringify(options)).then(res => {
      let data = res.data
      let oneLinkID = options.oneLinkID
      if(data.includes(oneLinkID)) {
        setShortLinkURL(data)
        let shortLinkIDVal = data.slice(-(data.length - (data.indexOf(oneLinkID) + oneLinkID.length + 1)))
        setShortLinkID(shortLinkIDVal)

        var url = new URL(data)
        url.hostname = "onelink-sim.stg4.onelinkstg.com"
        setBrandedLinkURL(url.href)
      }
    })

  }

  const classes = useStyles()

  // const webURL = `https://www.appsflyer.com/webDemo/`
  const webURL = `https://chayev.github.io/appsflyer-smartbanner-fruits/`
  // const webURL = `https://chayev.github.io/appsflyer-smartbanner-fruits/products/${selectedPage}`

  const TooltipContentDeepLinkValue = () => (
    <div>
      <Typography variant="body2">
        The specific page displays in the link as the 'deep_link_value' parameter.
      </Typography>
    </div>
  )
  
  const TooltipContentDeepLinkSub1 = () => (
    <div>
      <Typography variant="body2">
        The amount of fruit displays in the link as the 'deep_link_sub1' parameter. 
      </Typography>
    </div>
  )

  return (
    <Wrapper>
      <Typography
        variant="body1"
        weight="bold"
        color="primary"
        className={classes.innerForm}
      >
        Deep link users with app installed
      </Typography>

      <FormLabel>
        <Typography
          variant="body2"
          color="textPrimary"
          className={classes.paddingLeft}
        >
          Open a specific page in the app 
          <StyledTooltip
            placement="right"
            interactive
            classes={{ tooltip: 'AFTooltip-light' }}
            title={<TooltipContentDeepLinkValue />}>
            <InfoOutlinedIcon
              className={classes.helpIcon}
              fontSize="small"
              color="action"
            />
          </StyledTooltip>
        </Typography>
      </FormLabel>

      <ToggleButtonGroup
        size="small"
        value={selectedPage}
        onChange={(_, selectedPage) => setSelectedPage(selectedPage)}
        exclusive
        className={classes.innerForm}
      >
        <ToggleButton
          value="peaches"
          label="Peaches"
          icon={<TogglePeach isSelected={selectedPage === "peaches"} />}
        />
        <ToggleButton
          value="apples"
          label="Apples"
          icon={<ToggleApple isSelected={selectedPage === "apples"} />}
        />
        <ToggleButton
          value="bananas"
          label="Bananas"
          icon={<ToggleBanana isSelected={selectedPage === "bananas"} />}
        />
      </ToggleButtonGroup>

      <Select
        options={[
          { value: "1", label: "1" },
          { value: "5", label: "5" },
          { value: "10", label: "10" },
          { value: "25", label: "25" },
          { value: "99", label: "99" },
        ]}
        label={
          <>
            Display the amount of fruit
            <StyledTooltip
              placement="right"
              interactive
              classes={{ tooltip: 'AFTooltip-light' }}
              title={<TooltipContentDeepLinkSub1 />}>
              <InfoOutlinedIcon
                className={classes.helpIcon}
                fontSize="small"
                color="action"
              />
            </StyledTooltip>
          </>
        }
        value={fruitAmount}
        onChange={setFruitAmount}
        size="fullWidth"
        className={classes.outerForm}
      />

      <Typography
        variant="body1"
        weight="bold"
        color="primary"
        className={classes.innerForm}
      >
        Redirect users without app installed
      </Typography>

      <Select
        options={[
          { value: "appStore", label: "App Store" },
          {
            value: webURL,
            label: "Web Page",
          },
        ]}
        label="On iOS, redirect to:"
        value={iOSRedirect}
        onChange={setIOSRedirect}
        size="fullWidth"
        className={classes.innerForm}
      />

      <Select
        options={[
          { value: "playStore", label: "Play Store" },
          {
            value: webURL,
            label: "Web Page",
          },
        ]}
        label="On Android, redirect to"
        value={androidRedirect}
        onChange={setAndroidRedirect}
        size="fullWidth"
        className={classes.innerForm}
      />

      <Select
        options={[
          {
            value: webURL,
            label: "Web Page",
          },
          { value: "https://www.google.com/", label: "Google Search" },
          { value: "https://www.amazon.com/", label: "Amazon" },
        ]}
        label="On desktop, redirect to"
        value={webRedirect}
        onChange={setWebRedirect}
        size="fullWidth"
        className={classes.outerForm}
      />

      <Button
        variant="contained"
        size="medium"
        color="primary"
        fullWidth
        onClick={generateLinks}
      >
        Create Link
      </Button>
    </Wrapper>
  )
}
