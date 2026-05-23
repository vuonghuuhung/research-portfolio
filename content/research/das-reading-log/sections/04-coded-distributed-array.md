---
title: "Network Layer for DAS: Coded Distributed Array"
---

Our solution starts from a simple disagreement with RDA's storage rule.

RDA says:

> Put the full chunk in every node of the destination column.

CDA asks:

> What if nodes in that column store different coded pieces instead?

That is the main idea behind **Coded Distributed Arrays**.
We keep the grid intuition from RDA, but we avoid full-column replication by applying Random Linear Network Coding, or `RLNC`, at the data-piece level.

## The intuition behind RLNC

RLNC is useful because it lets data be recovered from enough random linear combinations.

Instead of storing exact copies of a piece, nodes can store coded pieces.
If a sampler later gathers enough independent coded pieces, it can reconstruct the original symbol or chunk.

This gives CDA a different tradeoff from RDA:

- RDA downloads from one honest node that stores a full chunk;
- CDA may need to collect several smaller coded pieces;
- but each stored piece is much smaller, and the column no longer needs full replication everywhere.

So CDA accepts a more involved reconstruction path in exchange for lower storage and propagation cost.

## CDA data encoding

The paper describes CDA as an extra RLNC layer on top of the erasure-coded block.

At a high level:

1. start with a raw block;
2. apply 2D Reed-Solomon erasure coding to get an extended block;
3. divide each cell into smaller fragments;
4. generate an RLNC-coded piece from those fragments using a random coding vector.

The result is not just one encoded block.
Different coded versions can be generated from the same extended block by using different random coding vectors.

That matters because the network can store diversity instead of duplication.
Nodes in the same custody column do not all need to hold the same full chunk.
They can hold different coded versions that collectively support reconstruction.

## Commitment and verification

The hard part is not only coding the data.
The verifier must still know that a coded piece is valid.

In normal DAS, KZG commitments let a verifier check that a sampled cell belongs to the committed blob.
CDA still needs that property, but RLNC introduces linear combinations of fragments.

The key observation in the paper is that KZG commitments are additively homomorphic.
That means a commitment to a linear combination can be derived from the same linear combination of commitments.

So if a coded piece is built with coding vector `g`, the corresponding commitment and opening can be combined with the same vector.
This lets a verifier check a coded piece directly, without reconstructing the original symbol first.

This is important because CDA would not be useful if every sample required full reconstruction before verification.
The commitment layer has to preserve both:

- **position binding**: the piece belongs to the claimed position;
- **code binding**: the piece is consistent with the committed encoded data.

## CDA network layer

CDA keeps the grid topology because the grid is what makes RDA's retrieval path clean.
Nodes are assigned to cells in a `k1 × k2` network matrix.
Each node maintains peers in its row and column.
Bootstrap nodes help new nodes discover the network and synchronize historical data.

The difference is what happens inside a custody column.

### STORE

When a block is published:

1. the publisher splits the extended block into chunks;
2. each chunk is assigned to a destination network column;
3. nodes receiving that chunk generate RLNC-coded versions;
4. coded chunks are sent to peers in the destination column;
5. each receiver verifies the coded pieces and stores valid ones.

Compared with RDA, the column stores coded diversity rather than repeated full copies.
Each node stores only a coded version, which is smaller than the full chunk.

### GET

When a sampler wants a symbol:

1. it identifies which chunk and custody column contain the target position;
2. it asks the relevant peers for RLNC pieces;
3. an honest peer gathers enough valid coded pieces from the column;
4. the symbol is decoded and returned to the sampler;
5. if the direct path fails, the sampler can fall back through bootstrap nodes, similar to RDA.

This is the central CDA tradeoff.
Sampling may require more than one coded piece, but each piece is much smaller and the network stores much less duplicated data.

## What CDA improves

The paper evaluates CDA against RDA under the same style of security constraints.
The main result is that CDA keeps the grid-based robustness intuition while reducing several costs:

- around `5x` lower storage/replication cost;
- around `2x` lower propagation cost;
- around `1.4x` lower historical synchronization cost for new nodes.

The reason is straightforward.
RDA uses replication to make retrieval simple.
CDA uses coding to make replication cheaper.

This does not mean CDA is free.
Its main tradeoff is that symbol reconstruction may require downloading multiple coded pieces from different nodes.
That can affect sampling latency, and the paper leaves real-network latency evaluation as future work.

But for me, this is exactly why CDA is interesting.
It shows that the network layer of DAS is still open.
There is room to design systems that are not only cryptographically secure, but also more efficient in how they store, disseminate, and recover data across a real peer-to-peer network.

That is the research direction I want to keep exploring.
