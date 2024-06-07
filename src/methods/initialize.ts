import type { BaseOidcClient } from "@/core/BaseOidcClient";
import { validateOptions } from "@/utils/validateOptions";
import { Issuer } from "openid-client";

export async function initialize(this: BaseOidcClient) {
  const { issuerUrl, logger } = this;

  logger?.trace("methods/initialize");

  // Discover IdP by discovery endpoint
  this.issuer = await Issuer.discover(issuerUrl);

  validateOptions(this);

  // Initialize RP
  this.client = new this.issuer.Client(this.clientMetadata);

  // Issuer identifier
  // - For multiple issuers
  // - Identical to iss claim in the ID token
  // Ref. https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata
  this.clients[this.issuer.metadata.issuer] = this.client;

  this.initialized = true;
}
