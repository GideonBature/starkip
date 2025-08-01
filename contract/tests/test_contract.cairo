#[cfg(test)]
mod test_contract {
    use core::result::ResultTrait;
    use starkip::IStarkipTippingDispatcher;
    use starkip::IStarkipTippingDispatcherTrait;
    use snforge_std::{
        ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
        stop_cheat_caller_address,
    };
    use starknet::{ContractAddress, contract_address_const};

    // Test constants
    fn CREATOR() -> ContractAddress {
        contract_address_const::<0x123456789abcdef>()
    }
    fn TIPPER() -> ContractAddress {
        contract_address_const::<0x555666777888999>()
    }
    fn TOKEN() -> ContractAddress {
        contract_address_const::<0xdead>()
    }

    // Deploy contract function
    fn deploy_contract() -> IStarkipTippingDispatcher {
        let declare_result = declare("StarkipTipping").expect('Failed to declare contract');
        let contract_class = declare_result.contract_class();
        let (contract_address, _) = contract_class.deploy(@array![]).expect('Failed to deploy contract');

        IStarkipTippingDispatcher { contract_address }
    }

    #[test]
    fn test_creator_registration() {
        let dispatcher = deploy_contract();
        let creator = CREATOR();

        start_cheat_caller_address(dispatcher.contract_address, creator);
        let creator_id = dispatcher.register_creator('Alice');
        stop_cheat_caller_address(dispatcher.contract_address);

        assert(creator_id == 1, 'ID should be 1');
        assert(dispatcher.get_total_creators() == 1, 'Total creators should be 1');
        let (addr, name) = dispatcher.get_creator(creator_id);
        assert(addr == creator, 'Addr incorrect');
        assert(name == 'Alice', 'Name incorrect');
    }

    #[test]
    fn test_tip_recording() {
        let dispatcher = deploy_contract();
        let creator = CREATOR();
        let tipper = TIPPER();
        let token = TOKEN();

        start_cheat_caller_address(dispatcher.contract_address, creator);
        let creator_id = dispatcher.register_creator('Alice');
        stop_cheat_caller_address(dispatcher.contract_address);

        start_cheat_caller_address(dispatcher.contract_address, tipper);
        dispatcher.record_tip(creator_id, 1000, token);
        stop_cheat_caller_address(dispatcher.contract_address);

        assert(dispatcher.get_creator_tips_total(creator_id) == 1000, 'Total incorrect');
        assert(dispatcher.get_creator_tips_count(creator_id) == 1, 'Count incorrect');
    }

    #[test]
    #[should_panic]
    fn test_register_twice_panics() {
        let dispatcher = deploy_contract();
        let creator = CREATOR();

        start_cheat_caller_address(dispatcher.contract_address, creator);
        dispatcher.register_creator('Alice');
        dispatcher.register_creator('AliceAgain'); // This should panic
        stop_cheat_caller_address(dispatcher.contract_address);
    }

    #[test]
    fn test_get_creator_id_and_info() {
        let dispatcher = deploy_contract();
        let creator = CREATOR();
        start_cheat_caller_address(dispatcher.contract_address, creator);
        let creator_id = dispatcher.register_creator('Alice');
        stop_cheat_caller_address(dispatcher.contract_address);
        // get_creator_id
        let fetched_id = dispatcher.get_creator_id(creator);
        assert(fetched_id == creator_id, 'ID should match registered ID');
        // get_creator
        let (addr, name) = dispatcher.get_creator(creator_id);
        assert(addr == creator, 'Fetched address should match');
        assert(name == 'Alice', 'Fetched name should match');
    }

    #[test]
    fn test_get_total_creators() {
        let dispatcher = deploy_contract();
        let creator1 = CREATOR();
        let creator2 = contract_address_const::<0x987654321fedcba>();
        start_cheat_caller_address(dispatcher.contract_address, creator1);
        dispatcher.register_creator('Alice');
        stop_cheat_caller_address(dispatcher.contract_address);
        start_cheat_caller_address(dispatcher.contract_address, creator2);
        dispatcher.register_creator('Bob');
        stop_cheat_caller_address(dispatcher.contract_address);
        assert(dispatcher.get_total_creators() == 2, 'Should have 2 creators');
    }

    #[test]
    fn test_creator_tip_stats_zero() {
        let dispatcher = deploy_contract();
        let creator = CREATOR();
        start_cheat_caller_address(dispatcher.contract_address, creator);
        let creator_id = dispatcher.register_creator('Alice');
        stop_cheat_caller_address(dispatcher.contract_address);
        assert(dispatcher.get_creator_tips_total(creator_id) == 0, 'Initial tips total should be 0');
        assert(dispatcher.get_creator_tips_count(creator_id) == 0, 'Initial tips count should be 0');
    }

    #[test]
    fn test_nonexistent_creator_returns_zero() {
        let dispatcher = deploy_contract();
        let non_existent_id: u64 = 2_u64; // Only one creator registered in other tests
        let (_, name) = dispatcher.get_creator(non_existent_id);
        assert(name == 0_felt252, 'Not creator should be zero');
        assert(dispatcher.get_creator_tips_total(non_existent_id) == 0_u256, 'Not creator tips total be 0');
        assert(dispatcher.get_creator_tips_count(non_existent_id) == 0_u64, 'Not creator tips count be 0');
    }
}
