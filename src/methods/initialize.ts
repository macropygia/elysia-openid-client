import type { BaseOidcClient } from "@/core/BaseOidcClient";
import { validateOptions } from "@/utils/validateOptions";
import { Issuer } from "openid-client";

export async function initialize(this: BaseOidcClient) {
  const { logger } = this;

  logger?.trace("functions/initialize");

  // Discover IdP by discovery endpoint
  this.issuer = await Issuer.discover(this.issuerUrl);
  this.issuerMetadata = this.issuer.metadata;

  validateOptions(this);

  // Initialize RP
  this.client = new this.issuer.Client(this.clientMetadata);

  this.initialized = true;
}
