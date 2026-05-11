import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required for checkout");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { planType } = req.body;
      
      let unitAmount = 6995;
      let planName = "Nexus Studio Premium Plan";
      let planDescription = "Full access to our high-performance design toolset.";
      let mode: any = "payment";

      if (planType === "starter") {
        unitAmount = 2000; // $20.00
        planName = "Nexus Starter Plan";
        planDescription = "Essential features for emerging digital monuments.";
        mode = "subscription";
      } else {
        // Professional/Studio plan
        unitAmount = 6995;
        planName = "Nexus Studio Professional Plan";
        planDescription = "Full architectural suite and priority creative support.";
        mode = "payment";
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: planDescription,
              },
              unit_amount: unitAmount,
              ...(mode === 'subscription' ? { recurring: { interval: 'month' } } : {})
            },
            quantity: 1,
          },
        ],
        mode: mode,
        automatic_tax: { enabled: true },
        ...(mode === 'subscription' ? { 
          subscription_data: { 
            trial_period_days: 7,
          } 
        } : {}),
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
      });

      res.json({ id: session.id });
    } catch (error) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  app.post("/api/create-portal-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { session_id } = req.body;

      // Retrieve the checkout session to get the customer ID
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
      
      if (!checkoutSession.customer) {
        throw new Error("No customer associated with this session");
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer as string,
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}/`,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      console.error("Portal Session Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
