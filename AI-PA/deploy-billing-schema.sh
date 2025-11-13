#!/bin/bash

# Billing Schema Deployment Script
# This script deploys the billing_reminders table to Supabase

echo "🚀 Deploying Billing Schema to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked to Supabase."
    echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

# Deploy the schema
echo "📤 Uploading schema..."
supabase db push --db-url "$DATABASE_URL" < src/lib/db/billing-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Billing schema deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify table in Supabase Dashboard → Table Editor"
    echo "2. Test by adding a bill in your app"
    echo "3. Deploy Edge Function: supabase functions deploy billingReminder"
else
    echo "❌ Deployment failed. Please check the error above."
    exit 1
fi

