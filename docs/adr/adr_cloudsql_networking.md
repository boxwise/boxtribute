# ADR: CloudSQL networking configuration
Decision Deadline: 8 Jan 2023
Discussion Participants: Hans, James, Philipp

## Status

Completed

## Context or Problem Statement

This is a retrospective ADR to explain our current CloudSQL configuration, triggered by the discovery of a seemingly unnecessary serverless VPC connector to connect App Engine to CloudSQL instances with a private IP.

## Decision Drivers

1. Ensuring configuration is secure
2. Reducing running costs

## Considered Options

a. Configure CloudSQL (and replica) to use a Private IP
b. Continue to use a Public IP.

If the CloudSQL instances had a public IP and then was exposed openly to the world - that would be a big downside. But in GCP, even if it has a public IP it’s still only accessible via their proxy (essentially a VPN) unless there are explicit authorized IPs added (which there are not). Documentation here: https://cloud.google.com/sql/docs/mysql/connect-overview#public_and_private_ip

If we were running more extensive cloud infrastructure, the cost implications (< $20/mo) would be neglible and using the private IP would probably make sense for a slightly 'tighter' network setup. However, given cost sensitivity, there appear to be limited downsides to keeping the public IP.

## Decision

CloudSQL instances will remain with public IP addresses.

## Consequences

We can remove an unused Serverless VPC connector that was running up costs unnecessarily.
