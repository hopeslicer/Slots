<window name="insert">
        <div class="flex flex-wrap p-6 bg-dark h-full">
          <div class="w-4/5">
            <div class="text-2xl">Insert XYA</div>
          </div>
          <div class="w-1/5 text-right">
            <i @click="$modal.hide('insert')" class="fas fa-times cursor-pointer text-xl"></i>
          </div>
          <div class="mt-4 flex w-full items-start justify-start">
            <input type="text" v-model="xyaAmount" />

            <div class="text-center w-full">
              <a v-on:click="insertCoin()" href="javascript:;"><span>Confirm</span></a>
            </div>
          </div>
        </div>
      </window>

      <window id='tutorial' name="tutorial">
        <div class="flex flex-wrap p-6 bg-dark h-full">
          <div class="w-4/5">
            <div class="text-2xl">Tutorial</div>
          </div>
          <div class="w-1/5 text-right">
            <i @click="$modal.hide('tutorial')" class="fas fa-times cursor-pointer text-xl"></i>
          </div>
          <div class="text-center w-full">
          </div>
          <div class="mt-4 flex flex-col w-full" style='min-height: 175px'>
            <template v-if="tutorial.page === 0">
              <p class="text-xl">Credits</p>
              <p class='txt-tutorial'>
                In order to play the game you need to <span>insert XYA</span> into the
                machine, which will be converted into game credits at a <span>1:1 rate</span>.
              </p>
            </template>

            <template v-if="tutorial.page === 1">
              <p class="text-xl">Holds</p>
              <p class='txt-tutorial'>
                Using a <span>HOLD</span> will pin the selected reel in place for one
                round.
              </p>
              <br>
              <p class='txt-tutorial'>
                After every spin you have a <span>{{ holdInfo.chance }}%</span> to receive
                between <span>{{ holdInfo.min }}</span> and <span> {{ holdInfo.max }} </span> holds.
              </p>
            </template>

            <template v-if="tutorial.page === 2">
              <p class="text-xl">Nudges</p>
              <p class='txt-tutorial'>Using a <span>Nudge</span> will move the reel up one position.</p>
              <br>
              <p class='txt-tutorial'>
                After every spin you have a <span>{{ nudgeInfo.chance }}%</span> to receive
                between <span>{{ nudgeInfo.min }}</span> and <span>{{ nudgeInfo.max }}</span> nudges.
              </p>
            </template>

            <template v-if="tutorial.page === 3">
              <p class="text-xl">Bank</p>
              <p class='txt-tutorial'>
                Every winning combination will reward a specific number of
                tokens which are stored in the bank.
              </p>
              <br>
              <p class='txt-tutorial'>
                You can withdraw these tokens at any time by using the
                <span>Collect</span> button.
              </p>
            </template>
          </div>
          <div class='w-full flex justify-center cursor-pointer select-none'>
            <span><a v-bind:class='{"opacity-50": tutorial.page - 1 < 0}'
                v-on:click='tutorial.page = Math.max(0, tutorial.page - 1)' class="mr-5">Previous</a>
              <a v-bind:class='{"opacity-50": tutorial.page + 1 > tutorial.pages}'
                v-on:click='tutorial.page = Math.min(tutorial.pages, tutorial.page + 1)'>Next</a></span>
          </div>
        </div>
      </window>