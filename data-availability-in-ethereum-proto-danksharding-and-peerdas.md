# Data Availability in Ethereum: Proto Danksharding and PeerDAS

Author: Hans Vuong  
Published: Nov 8, 2025  
Source: https://medium.com/@vuonghuuhung2002/data-availability-in-ethereum-proto-danksharding-and-peerdas-96059847b387

> “Ethereum doesn’t need every node to store all rollup data forever — it only needs to make sure the data was truly available when it mattered.”

Hi everyone! Today I want to start a new topic that I’ve recently spent some time researching — Data Availability on Blockchain
In most blockchain networks, validators, miners, or other participants (which I’ll simply refer to as nodes) are responsible for maintaining network consensus and executing transaction logics. To do this, each node must store the entire blockchain ledger. This full data replication ensures security and consistency, but it also creates major scalability challenges as the network grows.
Because of this limitation, many blockchain foundations and researchers have started exploring new approaches to improve scalability — and Ethereum is leading the way.

After a few months of studying this topic, I’d like to share some key milestones Ethereum has achieved (and is planiing next) to solve the Data Availability problem through innovations like Proto-Danksharding and PeerDAS.

Let’s dive in.

## Data Availability Sampling on Ethereum — Why It Matters?

Layer 2 rollups work by executing batches of transactions off-chain through a sequencer, then posting the results back to Ethereum’s Layer 1.
But why do we need to do that?
Because Layer 1 temporarily stores that data so anyone can verify whether the sequencer’s state update is valid. In short, Ethereum’s Layer 1 ensures that the batched transactions coming from Layer 2 are legitimate. (If you’d like to dive deeper into how rollups work, check out [this post](https://blog.blockmagnates.com/layer-2-explained-from-ethereum-state-transitions-to-rollups-cfa964bdb443).)

The Problem: CALLDATA Congestion
In the past, rollups submitted their updated data using a field called CALLDATA, which is stored permanently in Ethereum blocks and processed by the Execution Layer — even though it doesn’t actually need to be.

Why is that an issue?

Because verifiers on L2 only need Ethereum to keep the data available for a short time, long enough to validate the state updates. This design caused unnecessary congestion and became a major bottleneck for Ethereum’s scalability.

The Fix: Rethinking Data Storage

To solve this, Ethereum researchers proposed a few key ideas:

1. Move this data out of the Execution Layer.

Instead of processing it in the EVM, store it on the Consensus Layer (the Beacon Chain) to free up computation and space.

2. Keep the data available only temporarily.

It doesn’t need to live on-chain forever — just long enough for verification.

3. Let validators store only small parts of the data.

Together, they can still guarantee that the full dataset remains accessible to everyone

From Ideas to Implementation
Ideas (1) and (2) require Ethereum developers to redesign how data flows between the Execution Layer and the Consensus Layer — rethinking how fees, storage, and gas accounting work. That’s already complex, but still within reach.

But what about idea (3)?
How can validators store only small pieces of data while ensuring that everyone can access the full dataset?
That question led to the concept of Data Availability Sampling (DAS) — a method to ensure that data remains available without every validator storing it all. Before diving into DAS itself, let’s first see how Ethereum implemented ideas (1) and (2) through Proto-Danksharding.

## Proto-Danksharding — What has been achieved?

In short, Proto-Danksharding (EIP-4844) introduces a new way to handle Layer 2 data on Ethereum.:

- It separates rollup data from traditional CALLDATA and stores it in blobs — temporary chunks of data that live only on the Consensus Layer (not the Execution Layer).
- Each Ethereum block can currently include up to 6 blobs (in the Deneb upgrade), and this limit will increase to 9 blobs in the upcoming Electra upgrade.
- Each blob is about 128 KB in size.
- Validators now have an additional duty: they must keep these blobs available for at least 4,096 epochs — roughly 18 days.

How Proto-Danksharding Works

This design effectively solves the first two bottlenecks we mentioned in Part 1 — reducing Execution Layer pressure and limiting how long data needs to persist.

Here’s how it works in practice:

1. Blobs replace CALLDATA for L2 submissions

Instead of submitting transaction data through CALLDATA, rollups now post their data into blobs. This change dramatically reduces the processing load on the Execution Layer, since blob data no longer needs to be executed or permanently stored there.
On the Consensus Layer, blob data is distributed using channels called blob sidecar topics (e.g., `blob_sidecar_{n}`). Each topic acts as a separate communication stream — a way for nodes to exchange and temporarily store specific types of data without mixing them together. In other words, topics help organize how data flows across the network and which validators are responsible for keeping it available.
(For a deeper dive into how data propagates on the Consensus Layer, check out [this post](https://blog.blockmagnates.com/ethereum-consensus-layer-from-peer-discovery-with-discv5-to-message-propagation-with-gossipsub-3536e8952e5c).)
According to EIP-4844 (Proto-Danksharding):

- Each Ethereum block can include up to 6 blobs.
- Each blob contains roughly 128 KB of data.
- Every blob must remain available for at least 4,096 epochs (~18 days).

Each blob is tied to its own topic, enabling parallel data propagation and providing a scalable path to increase the blob count in future upgrades.

> However, it’s worth noting that all nodes still need to download every blob, meaning true sharding is not yet active in Proto-Danksharding.

2. Each blob includes a KZG Commitment and KZG Proofs.

Each blob includes a KZG commitment and a KZG proof. (see [this example](https://blobscan.com/))

These cryptographic proofs allow nodes to verify whether a blob is valid, determine where it belongs, and ensure that its contents haven’t been tampered with.
The true strength of KZG commitments doesn’t fully shine in the current Proto-Danksharding stage, since the actual sharding phase hasn’t been activated yet. However, KZG will play a central role in PeerDAS, where it enables validators to verify data availability through sampling rather than storing full data.

Since the introduction of EIP-4844, before a node can mark a block as valid, it must:

- Retrieve all blobs associated with that block (along with their proofs).
- Verify that each proof matches its KZG commitment.

> Proto-Danksharding relieves pressure on the Execution Layer by moving Layer 2 transaction data into temporary blobs stored on the Consensus Layer. This approach improves storage efficiency for validators and keeps Ethereum scalable as L2 usage grows.
>
> However, it also introduces trade-offs: Validators now face higher communication and bandwidth costs, since all nodes must still download every blob. In other words, Proto-Danksharding makes Ethereum more efficient, but not yet truly scalable.

Limitation of this approach

As mentioned earlier, each Ethereum block can currently include a maximum of 6 blobs. If you look at Ethereum’s real-time data — such as blob fees or the number of blobs per block — you’ll notice frequent spikes. This reflects a simple fact: demand for blobs, primarily from Layer 2 rollups, already exceeds supply, leading to rising blob fees and occasional congestion.
Naturally, the next question is: How can Ethereum safely increase the blob count to provide more space for rollups?

However, scaling up the blob capacity isn’t trivial. Every node in the network must download and verify all blobs within the block’s 4-second slot window. At the current limit of 6 blobs, this requires around 192 KB/sec of average bandwidth.
Now imagine increasing the blob limit fivefold — to 30 blobs per block. That would push bandwidth requirements to roughly 960 KB/sec, which is too demanding for many solo stakers or nodes with limited upload speeds. Such a change would risk reducing decentralization, as only high-bandwidth operators could keep up.
In short, while Proto-Danksharding improves data efficiency, it doesn’t yet solve the scalability trilemma between throughput, accessibility, and decentralization. That’s why Ethereum’s next step — sharding combined with Data Availability Sampling (DAS) — is so critical for the network’s long-term scalability.

> Proto-Danksharding laid the foundation. It moved Ethereum closer to scalable data availability — but the real transformation begins when validators no longer need to download everything themselves. That’s where PeerDAS comes in.

## PeerDAS — A Promising Path Toward More Blobs

In Proto-Danksharding (EIP-4844), every beacon node must download and retain all blobs from all blocks over 4,096 epochs (around 18 days). This guarantees data availability — but it also means that bandwidth and storage requirements grow linearly with the number of blobs. As demand from Layer 2s continues to rise, this model quickly becomes unsustainable.
PeerDAS (Peer-to-Peer Data Availability Sampling) offers a more scalable approach. Instead of requiring every node to fetch and store every blob, PeerDAS shards the responsibility for blob custody across nodes in the network. Each node is responsible for only a small fraction of the data, dramatically reducing individual resource costs while maintaining overall availability.
The challenge, however, is ensuring that all blobs remain accessible throughout their entire availability window (4,096 epochs). The most direct way to verify this would be for every node to download each blob — which is exactly how Proto-Danksharding currently operates. But even downloading data without permanently storing it still consumes considerable network bandwidth.

> PeerDAS solves this by introducing a new mechanism that guarantees data availability without requiring every node to download all blobs. Through coordinated data availability sampling, nodes can collectively verify that all data exists — efficiently, securely, and without overwhelming the network.

How does PeerDAS work ?

No in short more :)), we need to walk through the whole changes…

1. Erasure Coding — Turning Blobs Into Resilient Data

The first step is applying erasure coding to each blob. Erasure coding is a forward error correction (FEC) scheme designed to recover data even when some parts are missing. It takes a message of `k` symbols and produces a longer codeword of `n` symbols, such that the original message can be reconstructed from only a subset of them.
For PeerDAS, Ethereum uses an erasure coding ratio of 2, meaning every encoded blob requires twice the original storage size: a 128 KB blob becomes 256 KB after encoding. This redundancy is crucial — later, it allows data recovery even if some nodes go offline or fail to serve their part of the data.

2. From Rows to Columns — The 2D Data Layout

Next, the blob data is reorganized into a two-dimensional matrix:

- Each blob (row) is divided into 128 columns.
- Each cell = `256 KB / 128 = 2 KB`.
- Each column = `2 KB × 6 blobs = 12 KB`.

In the old Proto-Danksharding model, data was grouped by blobs (`blob_sidecar_{n}`).
PeerDAS replaces this with a new concept: data columns, transmitted via
`data_column_sidecar_{n}` topics, where `n = 0 … 127`.

Every node must store and serve at least 4 data columns, though they may choose to handle more. Validators have a higher minimum: 8 columns.

3. Determining Column Custody

Each node’s data custody is determined cryptographically and deterministically:

1. The node’s public key is derived from its private key.
2. A unique node ID is generated from this public key.
3. From that node ID, a unique sequence of 128 column indices is computed.
4. If the node must custody n columns, it takes the first n indices from the sequence.

This ensures a fair, deterministic distribution of data custody — every node knows exactly which columns it’s responsible for.

4. Discovering Custody Responsibilities

To make this system work across peers, a new field called `cgc` (Custody Global Columns) is added to each node’s ENR record. This acts like a global routing index for discovering which nodes hold which data columns.

PeerDAS introduces two new Req/Resp messages for blob discovery:

- `DataColumnSidecarsByRoot` — retrieves specific data columns by:
- block root, and
- column index.
- `DataColumnSidecarsByRange` — retrieves a range of columns by:
- start slot,
- count, and
- list of indices.

5. Custody Sampling — Verifying Availability Without Full Data

All of this setup leads to the custody sampling phase — the heart of PeerDAS. Sampling allows peers to verify that blob data is available without storing everything. It involves two key actions, both of which must succeed before a block is marked as “available”:

1. Download and store pre-assigned custody columns.
2. Randomly sample additional columns from other peers to check their availability (without storing them).

If enough peers perform this sampling, the network collectively ensures that the entire blob dataset is available, even though no single node holds it all. The below picture may help you understand PeerDAS easier if I make some misleading.

PeerDAS works

6. Why This Complexity Is Necessary

Why not just let each node hold a few blobs directly, like a simple row-based sharding model?
Because that would be trivially attackable.
For example, if each node only kept 2 blobs out of 6 per block, an attacker could DDoS or disconnect just the small group of nodes responsible for those rows — making those blobs effectively unavailable, even if committed on-chain.

PeerDAS prevents this vulnerability. By reorganizing data into columns and applying 2D erasure coding, recovery only fails if more than half of all column custodians across the network disappear — an enormously harder target.

> This shifts Ethereum’s data availability from fragile and local to robust and global.

7. The Economic and Scalability Impact

PeerDAS doesn’t scale Ethereum by making each node store more —
it scales by making each node store less, while ensuring collective verifiability.
For example:

- Each node custodies 4 columns (its assigned responsibility).
- Each node samples 4 additional random columns → So each node handles 8 columns total per block.

Now, suppose:

- Each cell = 2 KB,
- Up to 48 blobs per block.

Then each node processes:
`8 × 48 × 2 KB = 768 KB per block.`

That’s tiny compared to modern bandwidth, yet collectively, the network can support massive blob throughput.

## 8. Role of KZG Commitments

Finally, KZG commitments are the cryptographic glue that makes PeerDAS trustworthy. When a node samples a single cell (just 2 KB of data), it can instantly verify — using the KZG commitment — that this piece truly belongs to the original blob committed on-chain. This prevents dishonest nodes from faking samples and allows secure verification without downloading the entire blob.

In short:

> KZG commitments make small, random samples verifiable — the key to scaling data availability without sacrificing trust.

## Looking Ahead — Full Danksharding

That’s it for now — we’ve walked from Proto-Danksharding to PeerDAS, where Ethereum starts learning how to sample data instead of keeping the whole. In the next post, I’ll dive deeper into the magic behind KZG Commitments and Erasure Coding, and how they power Ethereum’s next scaling leap (2D PeerDAS, Robust Distributed Arrays, …).

Until then — stay curious, keep hacking, and see you on the dank side ^^

## Resources

A few references worth exploring if you want to dive deeper into how these mechanisms work under the hood:

- [Ethereum Consensus Layer — From Peer Discovery with discv5 to Message Propagation with Gossipsub](https://blog.blockmagnates.com/ethereum-consensus-layer-from-peer-discovery-with-discv5-to-message-propagation-with-gossipsub-3536e8952e5c)
- [Layer 2 Explained — From Ethereum State Transitions to Rollups](https://blog.blockmagnates.com/layer-2-explained-from-ethereum-state-transitions-to-rollups-cfa964bdb443)
- [PeerDAS Deep Dive — HackMD by Emmanuel Nalepa](https://hackmd.io/@manunalepa/peerDAS/https%3A%2F%2Fhackmd.io%2F%40manunalepa%2FB1idHCOfke)
- [Understanding Data Availability Sampling](https://paragraph.com/@linoscope/dRXHmgW3VMbxSCzESUEc)

Tags: Ethereum, Data Availability, Distributed Systems, Danksharding, Blockchain
