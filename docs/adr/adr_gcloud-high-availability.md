# ADR: GCloud high availability mode

[Trello-card](https://trello.com/c/BYNLaDQh/1377-discuss-gcloud-high-availability-mode-incl-action)

Decision Deadline: 2024-02-29

Author: @pylipp

## Status

Proposed.

## Context or Problem Statement

We use GCloud to host the boxtribute MySQL database in the cloud. It can be accessed by the app (deployed to Google App Engine), and by developers via the Cloud SQL proxy. The server resides in the `europe-west1` region in the zone `europe-west1-d`.

Our GCloud instance is configured in High Availability (HA) mode. Quoting the docs [1]:

> The purpose of an HA configuration is to reduce downtime when a zone or instance becomes unavailable. This might happen during a zonal outage, or when there's a hardware issue. With HA, your data continues to be available to client applications.
> The HA configuration provides data redundancy. A Cloud SQL instance configured for HA is also called a regional instance and has a primary and secondary zone within the configured region. Within a regional instance, the configuration is made up of a primary instance and a standby instance. Through synchronous replication to each zone's persistent disk, all writes made to the primary instance are replicated to disks in both zones before a transaction is reported as committed. In the event of an instance or zone failure, the standby instance becomes the new primary instance. Users are then rerouted to the new primary instance. This process is called a failover.

For the statviz project, we introduced a *read replica* of the primary database instance to transfer the load for reading large data sets (relatively to the data read for common app usage). The read replica resides in the `europe-west1-c` zone. Furthermore [2]:

> In a disaster recovery scenario, you can promote a replica to convert it to a primary instance. This way, you can use it in place of an instance that's in a region that's having an outage. You can also promote a replica to replace an instance that's corrupted.
> The read replica is an exact copy of the primary instance. Data and other changes on the primary instance are updated in almost real time on the read replica.
> Read replicas are read-only; you cannot write to them. The read replica processes queries, read requests, and analytics traffic, thus reducing the load on the primary instance.

A primary instance cannot failover to a read replica, and read replicas are unable to failover in any way during an outage. [3]

Our read replica does not have HA mode enabled itself.

Finally, we have nightly back-ups configured on the primary database instance with point-in-time recovery enabled.

## Decision Drivers

1. **Data safety**: we want user and app data to persist even if a GCloud outage happens
1. **Expenses**: we're being billed extra for HA mode [4]. The read replica is charged the same rate as a standard SQL instance [5].
1. **App availability**: we want to minimize app downtime if a GCloud outage happens

## Considered Options

A. Keep HA

B. Turn off HA

## Decision

Turn off HA.

This is performed by editing the primary database instance in the GCloud console [6].

## Consequences

1. *Data safety* In case of a GCloud outage, data is still available in the back-ups (which can be restored when the primary instance runs again but lost its data). Another possibility is to promote the read-replica in place of the failed primary instance.
1. *Expenses* We have less monthly costs for using GCloud.
1. *App availability* Without HA, if the primary instance has an outage, we'll have to react on an alert and manually promote the read-replica. Between the start of the outage and the promotion, the app will not be usable. To moderate this inconvenience we could consider one the following (in either case, it still won't be possible for users to perform actions to update data):
    - configure the boxtribute app to use the read-replica for any user requests to read data (i.e. GraphQL queries). We had this implemented already in a similar way
    - configure the boxtribute app to fallback to use the read-replica if connecting to the primary database instance fails.

## References

[1] https://cloud.google.com/sql/docs/mysql/high-availability

[2] https://cloud.google.com/sql/docs/mysql/replication

[3] https://cloud.google.com/sql/docs/mysql/replication#rr-info

[4] https://cloud.google.com/sql/docs/mysql/pricing

[5] https://cloud.google.com/sql/docs/mysql/replication#billing

[6] https://console.cloud.google.com/sql/instances?project=dropapp-242214
