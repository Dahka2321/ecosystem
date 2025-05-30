 
import { hexStringEquals } from '@eth-optimism/core-utils'
import { Contract } from 'ethers'

import type { AddressLike } from '../interfaces'
import { toAddress } from '../utils/coercion'
import { StandardBridgeAdapter } from './standard-bridge'

/**
 * Bridge adapter for ECO.
 * ECO bridge requires a separate adapter as exposes different functions than our standard bridge
 */
export class ECOBridgeAdapter extends StandardBridgeAdapter {
  public async supportsTokenPair(
    l1Token: AddressLike,
    l2Token: AddressLike
  ): Promise<boolean> {
    const l1Bridge = new Contract(
      this.l1Bridge.address,
      [
        {
          inputs: [],
          name: 'l1Eco',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.messenger.l1Provider
    )

    const l2Bridge = new Contract(
      this.l2Bridge.address,
      [
        {
          inputs: [],
          name: 'l2Eco',
          outputs: [
            {
              internalType: 'contract L2ECO',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.messenger.l2Provider
    )

    const [remoteL1Token, remoteL2Token] = await Promise.all([
      l1Bridge.l1Eco(),
      l2Bridge.l2Eco(),
    ])

    if (!hexStringEquals(remoteL1Token, toAddress(l1Token))) {
      return false
    }

    if (!hexStringEquals(remoteL2Token, toAddress(l2Token))) {
      return false
    }

    return true
  }
}
