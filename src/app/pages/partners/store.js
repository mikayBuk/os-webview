import {SetStore, ScalarStore} from '~/helpers/store';

export const books = new SetStore();
export const costs = new ScalarStore();
export const types = new ScalarStore();
export const advanced = new SetStore();
export const displayMode = new ScalarStore('grid');
export const sort = new ScalarStore('0');
export const resultCount = new ScalarStore('0');
