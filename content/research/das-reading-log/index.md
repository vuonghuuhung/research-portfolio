---
title: "DAS Research Log: From Ethereum Blobs to Coded Distributed Arrays"
order: 1
---

This research log is my own path through Data Availability Sampling.
It starts from the basic question of why a blockchain needs data availability at all, then moves into Ethereum's blob roadmap, the network-layer problem behind DAS, and finally the idea that became our first accepted paper: **Coded Distributed Arrays**.

I wrote this because I do not want the topic to appear only as a publication result.
For me, the important part is the path:

- understanding why full replication does not scale;
- seeing why Ethereum moved from `calldata` to blobs;
- realizing that DAS is not only a cryptographic problem, but also a peer-to-peer network problem;
- and then asking whether we can keep RDA's robustness while reducing its replication cost.

The log is organized into four parts:

- **What is DAS?**  
  Why simple splitting is not enough, how erasure coding changes the availability question, and why sampling can replace full download.
- **DAS on Ethereum**  
  How rollups use Ethereum for data publication, what `EIP-4844` changed, and how PeerDAS assigns blob custody through data columns.
- **Network Layer for DAS: RDA**  
  Why DHT and gossip-based designs are fragile or slow under adversarial conditions, and how Robust Distributed Arrays give a cleaner P2P structure.
- **Network Layer for DAS: CDA**  
  How our Coded Distributed Array direction uses RLNC and homomorphic KZG commitments to reduce storage and propagation overhead while keeping the grid-based security intuition.
