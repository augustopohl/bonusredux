import { all, select, takeLatest, call, put } from 'redux-saga/effects'
import { IState } from '../..';
import api from '../../../services/api';
import { addProductToCartRequest, addProductToCartSuccess, addProductToCartFailure } from './actions'
import { AxiosResponse } from 'axios';
import { ActionTypes } from './types';

type CheckProductStockRequest = ReturnType<typeof addProductToCartRequest>;

interface IStockResponse {
    id: number,
    quantity: number,
}

function* checkProductStock({ payload }: CheckProductStockRequest) {
    const { product } = payload;

    const currentQuantity: number = yield select((state : IState) => {
        return state.cart.items.find(item => item.product.id === product.id)?.quantity ?? 0;
    });

    const availableStockResponse: AxiosResponse<IStockResponse> = yield call(api.get, `stock/${product.id}`)

    if (availableStockResponse.data.quantity > currentQuantity) {
        yield put(addProductToCartSuccess(product));
    } else {
        yield put(addProductToCartFailure(product.id));
    }
}  // checkProduct

export default all([
    takeLatest(ActionTypes.addProductToCartRequest, checkProductStock) 
    // takeLatest() = se a checagem anterior ainda não finalizou e o usuario clica de novo, ele cancela as execuções anteriores e pegar apenas a última
    //takeEvery() = aguarda todas ações disparadas serem finalizadas
    // takeLeading() = pegar apenas a primeira ação disparada e descarta as últimas
])