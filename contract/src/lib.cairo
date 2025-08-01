/// Interface for the Starkip tipping platform.
/// This interface manages creator profiles and tip recording for direct wallet-to-wallet transfers.
#[starknet::interface]
pub trait IStarkipTipping<TContractState> {
    /// Register as a creator and get a unique tipping link ID.
    fn register_creator(ref self: TContractState, creator_name: felt252) -> u64;
    /// Update creator information.
    fn update_creator(ref self: TContractState, creator_name: felt252);
    /// Record a tip that was sent directly between wallets (optional for analytics).
    fn record_tip(ref self: TContractState, creator_id: u64, amount: u256, token_address: starknet::ContractAddress);
    /// Get creator information by ID.
    fn get_creator(self: @TContractState, creator_id: u64) -> (starknet::ContractAddress, felt252);
    /// Get creator ID by address.
    fn get_creator_id(self: @TContractState, creator_address: starknet::ContractAddress) -> u64;
    /// Get total tips received by a creator.
    fn get_creator_tips_total(self: @TContractState, creator_id: u64) -> u256;
    /// Get total number of tip transactions for a creator.
    fn get_creator_tips_count(self: @TContractState, creator_id: u64) -> u64;
    /// Get total registered creators.
    fn get_total_creators(self: @TContractState) -> u64;
}

/// Main Starkip tipping platform contract.
#[starknet::contract]
pub mod StarkipTipping {
    use starknet::ContractAddress;
    use starknet::storage::*;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use core::num::traits::Zero;

    #[storage]
    pub struct Storage {
        // Creator management
        total_creators: u64,
        creators: Map<u64, CreatorInfo>,
        creator_by_address: Map<ContractAddress, u64>,

        // Tip tracking (optional analytics)
        creator_tips_total: Map<u64, u256>,
        creator_tips_count: Map<u64, u64>,
        total_tips_recorded: u64,
    }

    #[derive(Drop, Serde, starknet::Store)]
    pub struct CreatorInfo {
        pub address: ContractAddress,
        pub name: felt252,
        pub created_at: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        CreatorRegistered: CreatorRegistered,
        CreatorUpdated: CreatorUpdated,
        TipRecorded: TipRecorded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CreatorRegistered {
        #[key]
        pub creator_id: u64,
        #[key]
        pub creator_address: ContractAddress,
        pub creator_name: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CreatorUpdated {
        #[key]
        pub creator_id: u64,
        #[key]
        pub creator_address: ContractAddress,
        pub new_name: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TipRecorded {
        #[key]
        pub tip_id: u64,
        #[key]
        pub creator_id: u64,
        #[key]
        pub tipper: ContractAddress,
        pub creator_address: ContractAddress,
        pub amount: u256,
        pub token_address: ContractAddress,
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.total_creators.write(0);
        self.total_tips_recorded.write(0);
    }

    #[abi(embed_v0)]
    impl StarkipTippingImpl of super::IStarkipTipping<ContractState> {
        fn register_creator(ref self: ContractState, creator_name: felt252) -> u64 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();

            // Check if creator already exists
            let existing_id = self.creator_by_address.entry(caller).read();
            assert(existing_id == 0, 'Creator already registered');

            // Generate new creator ID
            let creator_id = self.total_creators.read() + 1;
            self.total_creators.write(creator_id);

            // Create creator info
            let creator_info = CreatorInfo {
                address: caller,
                name: creator_name,
                created_at: timestamp,
            };

            // Store creator information
            self.creators.entry(creator_id).write(creator_info);
            self.creator_by_address.entry(caller).write(creator_id);

            // Emit registration event
            self.emit(Event::CreatorRegistered(CreatorRegistered {
                creator_id,
                creator_address: caller,
                creator_name,
                timestamp,
            }));

            creator_id
        }

        fn update_creator(ref self: ContractState, creator_name: felt252) {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();

            // Get creator ID
            let creator_id = self.creator_by_address.entry(caller).read();
            assert(creator_id != 0, 'Creator not registered');

            // Update creator info
            let mut creator_info = self.creators.entry(creator_id).read();
            creator_info.name = creator_name;
            self.creators.entry(creator_id).write(creator_info);

            // Emit update event
            self.emit(Event::CreatorUpdated(CreatorUpdated {
                creator_id,
                creator_address: caller,
                new_name: creator_name,
                timestamp,
            }));
        }

        fn get_creator(self: @ContractState, creator_id: u64) -> (ContractAddress, felt252) {
            let creator_info = self.creators.entry(creator_id).read();
            (creator_info.address, creator_info.name)
        }

        fn get_creator_id(self: @ContractState, creator_address: ContractAddress) -> u64 {
            self.creator_by_address.entry(creator_address).read()
        }

        fn get_creator_tips_total(self: @ContractState, creator_id: u64) -> u256 {
            self.creator_tips_total.entry(creator_id).read()
        }

        fn get_creator_tips_count(self: @ContractState, creator_id: u64) -> u64 {
            self.creator_tips_count.entry(creator_id).read()
        }

        fn get_total_creators(self: @ContractState) -> u64 {
            self.total_creators.read()
        }

        fn record_tip(ref self: ContractState, creator_id: u64, amount: u256, token_address: ContractAddress) {
            let tipper = get_caller_address();
            let timestamp = get_block_timestamp();

            // Verify creator exists
            let creator_info = self.creators.entry(creator_id).read();
            let zero_address: ContractAddress = Zero::zero();
            assert(creator_info.address != zero_address, 'Creator not found');

            // Validate inputs
            assert(amount > 0, 'Amount must be greater than 0');
            assert(creator_info.address != tipper, 'Cannot tip yourself');

            // Generate new tip ID
            let tip_id = self.total_tips_recorded.read() + 1;
            self.total_tips_recorded.write(tip_id);

            // Update creator tip totals
            let current_total = self.creator_tips_total.entry(creator_id).read();
            self.creator_tips_total.entry(creator_id).write(current_total + amount);

            let current_count = self.creator_tips_count.entry(creator_id).read();
            self.creator_tips_count.entry(creator_id).write(current_count + 1);

            // Emit tip recorded event
            self.emit(Event::TipRecorded(TipRecorded {
                tip_id,
                creator_id,
                tipper,
                creator_address: creator_info.address,
                amount,
                token_address,
                timestamp,
            }));
        }
    }
}
