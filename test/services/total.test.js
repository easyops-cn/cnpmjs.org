'use strict';

var Total = require('../../services/total');
var config = require('../../config');
var utils = require('../utils');
var mm = require('mm');

describe('services/total.test.js', function () {
  afterEach(mm.restore);

  describe('plusDeleteModule()', function () {
    it('should plus delete module count', function* () {
      var info = yield Total.getTotalInfo();

      yield Total.plusDeleteModule();
      var info2 = yield Total.getTotalInfo();
      // TODO: pg bigint will be string
      // https://github.com/sequelize/sequelize/pull/726
      info2.module_delete.should.equal(info.module_delete + 1);

      yield Total.plusDeleteModule();
      var info3 = yield Total.getTotalInfo();
      info3.module_delete.should.equal(info.module_delete + 2);
    });
  });

  describe('get()', function () {
    it('should get all total info, enableTotalCount: true', function* () {
      yield utils.createModule('test-services-total-get-enableTotalCount-true', '1.0.0');
      var info = yield Total.get();
      info.disk_size.should.be.a.Number();
      info.doc_count.should.above(0);
      info.doc_version_count.should.above(0);
    });

    it('should get all total info, enableTotalCount: false', function* () {
      mm(config, 'enableTotalCount', false);
      yield utils.createModule('test-services-total-get-enableTotalCount-false', '1.0.0');
      var info = yield Total.get();
      info.disk_size.should.be.a.Number();
      info.doc_count.should.equal(0);
      info.doc_version_count.should.equal(0);
    });
  });

  describe('setLastSyncTime()', function () {
    it('should set last sync timestamp', function* () {
      var info = yield Total.getTotalInfo();
      yield Total.setLastSyncTime(Date.now());
      var info2 = yield Total.getTotalInfo();
      info2.last_sync_time.should.above(info.last_sync_time);

      yield Total.setLastSyncTime(Date.now() + 10);
      var info3 = yield Total.getTotalInfo();
      info3.last_sync_time.should.above(info2.last_sync_time);
    });
  });

  describe('setLastExistSyncTime()', function () {
    it('should set last exist sync timestamp', function* () {
      var info = yield Total.getTotalInfo();
      yield Total.setLastExistSyncTime(Date.now());
      var info2 = yield Total.getTotalInfo();
      info2.last_exist_sync_time.should.above(info.last_exist_sync_time);

      yield Total.setLastExistSyncTime(Date.now() + 10);
      var info3 = yield Total.getTotalInfo();
      info3.last_exist_sync_time.should.above(info2.last_exist_sync_time);
    });
  });

  describe('updateSyncStatus()', function () {
    it('should set sync status', function* () {
      yield Total.updateSyncStatus(1);
      var info = yield Total.getTotalInfo();
      info.sync_status.should.equal(1);

      yield Total.updateSyncStatus(2);
      var info = yield Total.getTotalInfo();
      info.sync_status.should.equal(2);
    });
  });

  describe('updateSyncNum()', function () {
    it('should update sync numbers', function* () {
      var data = {
        syncStatus: 4,
        need: 10,
        success: 2,
        fail: 1,
        left: 9,
        lastSyncModule: 'haha-test'
      };

      yield Total.updateSyncNum(data);
      var info = yield Total.getTotalInfo();
      info.sync_status.should.equal(4);
      info.need_sync_num.should.equal(10);
      info.fail_sync_num.should.equal(1);
      info.left_sync_num.should.equal(9);
      info.last_sync_module.should.equal('haha-test');

      var data = {
        syncStatus: 4,
        need: 10,
        success: 2,
        fail: 1,
        left: 0,
        lastSyncModule: 'haha-test2'
      };

      yield Total.updateSyncNum(data);
      var info = yield Total.getTotalInfo();
      info.sync_status.should.equal(4);
      info.need_sync_num.should.equal(10);
      info.fail_sync_num.should.equal(1);
      info.left_sync_num.should.equal(0);
      info.last_sync_module.should.equal('haha-test2');
    });
  });
});
