---
title: "DAS on Ethereum"
---

Ethereum's data availability problem is easiest to understand through rollups.
Rollups execute transactions offchain, but they still need to publish enough data to Ethereum so that outsiders can reconstruct and verify the rollup state transition.

If that data is missing, users cannot independently check the rollup.
For optimistic rollups, missing data weakens fraud proofs.
For validity rollups, missing data makes it harder for outsiders to reconstruct the state transition behind the proof.

So the basic rule is:

> Ethereum does not need to execute all rollup transactions, but it must make the rollup data available long enough for verification.

## From `calldata` to blobs

Before `EIP-4844`, rollups commonly published data through `calldata`.
That worked, but it was a bad fit.

`calldata` belongs to the execution path.
It is attached to normal transactions, processed by the execution layer, and kept permanently in Ethereum history.
Rollup batch data does not need that treatment.
It mainly needs temporary availability.

![Rollup data posted as calldata puts pressure on the execution layer.](/assets/images/das-hans/calldata-execution-layer.webp)

`EIP-4844`, also called Proto-Danksharding, introduced blobs as a separate data lane for rollups.
The key change is that blob data is handled by the consensus layer and kept for a bounded availability window, instead of being permanent execution-layer data.

This gives Ethereum a cleaner separation:

- execution data stays on the execution path;
- rollup data goes into temporary blobs;
- block commitments refer to blob data without putting all blob bytes into the execution payload.

![Rollup sequencers publish blob data beside Ethereum blocks.](/assets/images/das-hans/blob-sidecars-by-block.webp)

Before a node accepts a block with blobs, it must be able to download and verify the associated blob data.
The block contains blob commitments, and the node checks the blob data against those commitments.

![A node verifies blob availability before accepting the block.](/assets/images/das-hans/blob-availability-check.webp)

Proto-Danksharding solved an important part of the problem:

- rollup data no longer has to live forever as `calldata`;
- Ethereum gets a dedicated temporary data lane;
- L2s get cheaper and more appropriate data publication.

But it did not yet solve the full scaling problem.
If every consensus node still downloads every blob, then blob capacity is limited by what normal nodes can handle.
Increasing blob count too far would push bandwidth requirements upward and weaken decentralization.

That leads to the next step: PeerDAS.

## PeerDAS: assigning data columns

PeerDAS tries to move Ethereum from full blob download toward custody and sampling.
Instead of every node storing every blob, blob data is erasure-coded and organized into data columns.

In the PeerDAS model:

- blob data is encoded into a larger structure;
- that structure is divided into columns;
- each node is assigned some columns to custody;
- nodes also sample additional columns from peers before accepting a block.

![PeerDAS organizes blob data into columns assigned to different nodes.](/assets/images/das-hans/peerdas-data-columns.webp)

This changes the responsibility of a node.
The node no longer has to store all blob data.
It must store its assigned custody columns and sample enough other columns to gain confidence that the full data is available.

The high-level flow is:

1. the block producer prepares blob data and commitments;
2. data is propagated into column sidecar topics;
3. each node downloads and stores its assigned columns;
4. each node samples additional columns without keeping all of them;
5. if enough samples succeed, the node can accept that the block data is available.

![PeerDAS combines assigned custody with random sampling.](/assets/images/das-hans/peerdas-custody-sampling-flow.webp)

This is a major improvement over full download.
It lets Ethereum increase blob throughput without forcing every validator to carry the entire data burden.

But PeerDAS also exposes the next bottleneck.
Once sampling becomes a network request, the quality of the peer-to-peer layer matters.
If retrieval is slow, unstable, or easy to attack, then the cryptographic sampling guarantee is not enough.

That is where my focus moved next.
The deeper problem became:

> How should a DAS network store, route, and recover coded data under Byzantine behavior?
