import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { availableSvgProviders, InteractiveSvg } from "app/assets/svg/svg-provider";
import parse from "html-react-parser";
import logo from "../assets/photos/logo.png";
import image from "../assets/photos/image.gif";
import { loadConnectionState } from "app/server/load-connection-state.server";
import { connectEmail, verifyEmail } from '../server/connect.server';
import { fetchShopId } from "../server/fetch-shop-id.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const shopId = await fetchShopId(admin);
  const connectState = await loadConnectionState(shopId);

  // To ensure connected users can see the Gallery after page refresh, we prepare images in the Loader
  // If connected, load images; otherwise return empty
  const images = connectState.user
    ? availableSvgProviders.map(provider => provider())
    : [];

  return {
    shopId: shopId,
    isConnected: connectState.user,
    user: connectState.user,
    images: images // Pass images to frontend
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shopId = await fetchShopId(admin);
  const formData = await request.formData();
  const type = formData.get('type');
  if (type === 'connect-email') {
    const email = formData.get('email') || '';
    await connectEmail(shopId, email.toString());
    return { success: false };
  } else if (type === 'verify-email') {
    const otp = formData.get('otp') || '';
    return await verifyEmail(shopId, otp.toString());
  } else {
    return { success: false };
  }
};

export default function InteractiveStudio() {
  const fetcher = useFetcher<typeof action>();

  // Get initial state and images from Loader
  const { isConnected, user, images: initialImages, shopId } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  // --- State Management ---
  const [inputEmail, setInputEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [showVerifyStep, setShowVerifyStep] = useState(false);

  // --- Logic Checks ---
  const isSubmitting = fetcher.state === "submitting";

  // Check if connected (Loader initial data OR Fetcher just succeeded)
  const isJustLoggedIn = fetcher.data?.success;
  const hasAccess = isConnected || isJustLoggedIn;

  // Prefer Fetcher data (latest), fallback to Loader data (initial)
  const currentUser = user;
  const currentImages = initialImages;

  useEffect(() => {
    if (isJustLoggedIn && currentUser) {
      shopify.toast.show(`${currentUser}, you're connected!`);
    }
  }, [isJustLoggedIn, currentUser, shopify]);

  // --- Event Handlers ---
  const handleConnectClick = () => {
    if (!inputEmail) {
      shopify.toast.show("Please enter an email address");
      return;
    }
    fetcher.submit(
      {
        type: 'connect-email',
        email: inputEmail
      },
      { method: "POST" }
    );
    setShowVerifyStep(true);
  };

  const handleVerifyClick = () => {
    if (!inputCode) {
      shopify.toast.show("Please enter the verification code");
      return;
    }
    // Submit to Action for validation
    fetcher.submit(
      {
        type: 'verify-email',
        otp: inputCode
      },
      { method: "POST" }
    );
  };

  const showPreview = (svg: InteractiveSvg) => {
    return (<s-box>{parse(svg.previewHtml)}</s-box>);
  }

  return (
    <s-page heading="Interactive Studio">

      {hasAccess ? (
        // --- 1. Connected state: Show welcome message ---
        <s-section heading="Welcome!">
          <s-paragraph>
            Welcome back <strong>{currentUser}</strong>!
          </s-paragraph>
        </s-section>
      ) : (
        // --- 2. Not connected state: Show connection guide and Modal ---
        <s-section heading="Welcome!">
          <s-paragraph>
            Welcome to use {" "}
            <s-text type="strong">
              <s-link href="https://interactivity.studio/" target="_blank">
                Interactive Studio
              </s-link>
            </s-text>
            {" "} to make your product images more interactive!
          </s-paragraph>
          <s-paragraph>
            Please connect your shopify store with{" "}
            <s-text type="strong">Interactive Studio</s-text>
            {" "}first.
          </s-paragraph>

          <s-stack direction="inline" gap="small">

            {/* Single connection entry point */}
            <s-button variant="primary" commandFor="modal">Connect to Slicpix</s-button>

            {/* Modal component */}
            <s-modal id="modal" heading="Connect to Slicpix">
              <s-paragraph>Enter your email to access your library.</s-paragraph>

              <s-stack direction="block" gap="medium">
                {/* Email input row */}
                <s-stack direction="inline" gap="small" style={{ alignItems: 'center' }}>
                  <s-email-field
                    label=""
                    placeholder="name@company.com"
                    value={inputEmail}
                    onInput={(e: any) => setInputEmail(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <s-button
                    variant="primary"
                    onClick={handleConnectClick}
                    disabled={showVerifyStep}
                  >
                    {showVerifyStep ? "Sent" : "Connect"}
                  </s-button>
                </s-stack>

                {/* Verification code input row (shown after clicking Connect) */}
                {showVerifyStep && (
                  <div style={{ marginTop: '10px' }}>
                    <s-stack direction="inline" gap="small" style={{ alignItems: 'center' }}>
                      <s-text-field
                        label=""
                        placeholder="Enter Code (Try 123456)"
                        value={inputCode}
                        onInput={(e: any) => setInputCode(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <s-button
                        variant="primary"
                        onClick={handleVerifyClick}
                        loading={isSubmitting}
                      >
                        Verify
                      </s-button>
                    </s-stack>
                  </div>
                )}
              </s-stack>

              <s-button slot="secondary-actions" commandFor="modal" command="--hide">
                Close
              </s-button>
            </s-modal>

          </s-stack>
        </s-section>
      )}

      {/* --- 3. Gallery Section --- */}
      {/* Only display if the user (hasAccess) permission and has image data.*/}
      {hasAccess && currentImages && currentImages.length > 0 && (
        <s-section heading="Your gallery">
          <s-paragraph>
            You will be able to select these interactive images from our theme extension
          </s-paragraph>
          <s-stack direction="inline" gap="base">
            {currentImages.map(image => showPreview(image))}
          </s-stack>
          <s-paragraph>
            Not seeing the ones you just created? (In real app, this will trigger a sync option from backend to upload new images to shopify)
            <s-stack>
              <s-button>Sync Now</s-button>
            </s-stack>
          </s-paragraph>
        </s-section>
      )}

      {/* --- Bottom section content --- */}
      <s-section heading="Get more out of the Box">
        <s-paragraph>
          Help user more creative and give them better interactive product images.
        </s-paragraph>

        <s-box padding="base" background="subdued" border="base" borderRadius="base">
          <s-stack direction="inline" gap="large" alignItems="center">
            <s-box inlineSize="150px" blockSize="150px">
              <s-image src={logo} alt="Inbox Logo" />
            </s-box>

            <s-stack direction="block" gap="small" alignItems="center">
              <s-heading>Interactive Studio</s-heading>
              <s-box inlineSize="300px">
                <s-image
                  src={image}
                  alt="image"
                  loading="lazy"
                  aspectRatio="20/5"
                  objectFit="cover"
                  borderRadius="base"
                />
              </s-box>
              <s-button href="https://interactivity.studio/">Create One Now! 🤩</s-button>
            </s-stack>
          </s-stack>
        </s-box>
      </s-section>

      <s-section slot="aside" heading="Resources">
        <s-unordered-list>
          <s-list-item>
            <s-link href="https://features.interactivity.studio/" target="_blank">
              Features - Interactivity Studio
            </s-link>
          </s-list-item>
          <s-list-item>
            <s-link href="https://help.interactivity.studio/articles/getting-started" target="_blank">
              Help - Getting Started with Interactivity Studio
            </s-link>
          </s-list-item>
          <s-list-item>
            <s-link href="https://slicpix.com/" target="_blank">
              About Us - SlicPix.Inc
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}