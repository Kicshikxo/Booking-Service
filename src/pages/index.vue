<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <Card class="border border-surface" :pt="{ body: { class: 'p-4!' } }">
      <template #title>События</template>
      <template #content>
        <div
          class="flex flex-col items-center justify-center gap-4 w-auto sm:w-[600px] lg:w-[900px]"
        >
          <div class="flex flex-col gap-4 w-full">
            <div class="flex gap-4 w-full">
              <Button label="Обновить" :loading="loadEventsLoading" @click="loadEvents" fluid />
              <Button label="Выйти" :loading="signOutLoading" @click="handleSignOut" fluid />
            </div>
            <Button label="Создать событие" @click="handleShowCreateEventModal" fluid />
          </div>
          <div v-if="events.length" class="flex flex-col gap-4 w-full">
            <Card
              v-for="event in events"
              :key="event.event_id"
              :pt="{ body: { class: 'p-4!' } }"
              class="border border-surface w-full h-full"
            >
              <template #title>{{ event.title }}</template>
              <template #subtitle>{{ event.description }}</template>
              <template #content>
                <div class="flex flex-col gap-4">
                  <Card
                    :pt="{ body: { class: 'p-4!' } }"
                    class="border border-surface w-full h-full"
                  >
                    <template #title>
                      <span>
                        Участники ({{ event.bookings.length
                        }}{{ event.total_seats ? '/' + event.total_seats : '' }})
                      </span>
                    </template>
                    <template #content>
                      <div class="flex flex-col gap-4">
                        <span v-for="booking in event.bookings" :key="booking.booking_id">
                          {{ booking.user.email }}
                        </span>
                      </div>
                    </template>
                  </Card>
                  <div class="flex flex-col sm:flex-row gap-4">
                    <Button
                      v-if="
                        !event.bookings.some(
                          (booking) => booking.user_id === sessionState.user?.userId,
                        )
                      "
                      label="Участвовать"
                      :loading="bookingEventsIds.some((id) => id === event.event_id)"
                      @click="handleReserveBooking(event.event_id)"
                      fluid
                    />
                    <Button
                      v-else
                      label="Не участвовать"
                      :loading="bookingEventsIds.some((id) => id === event.event_id)"
                      @click="handleUnreserveBooking(event.event_id)"
                      fluid
                    />
                    <Button
                      v-if="event.creator_id === sessionState.user?.userId"
                      label="Редактировать"
                      @click="handleShowEditEventModal(event.event_id)"
                      fluid
                    />
                    <Button
                      v-if="event.creator_id === sessionState.user?.userId"
                      label="Удалить"
                      :loading="deletingEventsIds.some((id) => id === event.event_id)"
                      @click="handleDeleteEvent(event.event_id)"
                      fluid
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>
          <div v-else-if="loadEventsLoading">
            <span class="pi pi-spin pi-spinner"></span>
          </div>
        </div>
      </template>
    </Card>

    <Dialog
      v-model:visible="eventModal.show"
      modal
      :header="eventModal.eventId ? 'Редактировать событие' : 'Создать событие'"
      :style="{ width: '25rem' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="title" class="font-semibold w-24">Заголовок</label>
        <InputText id="title" v-model="eventModal.title" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="description" class="font-semibold w-24">Описание</label>
        <InputText
          id="description"
          v-model="eventModal.description"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="totalSeats" class="font-semibold w-24">Количество мест</label>
        <InputNumber
          id="totalSeats"
          v-model="eventModal.totalSeats"
          show-clear
          allow-empty
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="plannedAt" class="font-semibold w-24">Планируемая дата</label>
        <DatePicker
          id="plannedAt"
          v-model="eventModal.plannedAt"
          show-clear
          class="flex-auto"
          autocomplete="off"
        />
      </div>

      <div class="flex gap-2">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          fluid
          @click="eventModal.show = false"
        />
        <Button
          type="button"
          :label="eventModal.eventId ? 'Сохранить' : 'Создать'"
          :loading="createEventLoading || editEventLoading"
          fluid
          @click="() => (eventModal.eventId ? handleEditEvent() : handleCreateEvent())"
        />
      </div>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Booking } from '../../server/dto/booking.dto'
import { Event } from '../../server/dto/event.dto'
import { User } from '../../server/dto/user.dto'
import { signOut } from '../assets/scripts/api/auth'
import { reserveBooking, unreserveBooking } from '../assets/scripts/api/booking'
import { createEvent, deleteEvent, getEvents, updateEvent } from '../assets/scripts/api/events'
import { sessionState } from '../composables/useSession'

const router = useRouter()

const events = ref<
  (Event & {
    bookings: (Booking & {
      user: User
    })[]
  })[]
>([])

const eventModal = reactive<{
  show: boolean
  eventId: string | null
  title: string
  description: string
  totalSeats: number | null
  plannedAt: Date | null
}>({
  show: false,
  eventId: null,
  title: '',
  description: '',
  totalSeats: null,
  plannedAt: null,
})

onMounted(async () => {
  await loadEvents()
})

const loadEventsLoading = ref(false)
async function loadEvents() {
  loadEventsLoading.value = true
  try {
    const data = await getEvents()

    events.value = data
  } catch {
    alert('Ошибка загрузки событий')
  } finally {
    loadEventsLoading.value = false
  }
}

const createEventLoading = ref(false)
function handleShowCreateEventModal() {
  eventModal.eventId = null
  eventModal.title = ''
  eventModal.description = ''
  eventModal.totalSeats = null
  eventModal.plannedAt = null

  eventModal.show = true
}
async function handleCreateEvent() {
  createEventLoading.value = true
  try {
    await createEvent({
      title: eventModal.title,
      description: eventModal.description,
      totalSeats: eventModal.totalSeats || null,
      plannedAt: eventModal.plannedAt || null,
    })
    await loadEvents()

    eventModal.show = false
  } catch {
    alert('Ошибка создания события')
  } finally {
    createEventLoading.value = false
  }
}

const editEventLoading = ref(false)
function handleShowEditEventModal(eventId: string) {
  const event = events.value.find((event) => event.event_id === eventId)

  eventModal.eventId = eventId
  eventModal.title = event?.title ?? ''
  eventModal.description = event?.description ?? ''
  eventModal.totalSeats = event?.total_seats ?? 0
  eventModal.plannedAt = event?.planned_at ? new Date(event?.planned_at) : null

  eventModal.show = true
}
async function handleEditEvent() {
  editEventLoading.value = true
  try {
    await updateEvent(eventModal.eventId!, {
      title: eventModal.title,
      description: eventModal.description,
      totalSeats: eventModal.totalSeats || null,
      plannedAt: eventModal.plannedAt || null,
    })
    await loadEvents()

    eventModal.show = false
  } catch {
    alert('Ошибка редактирования события')
  } finally {
    editEventLoading.value = false
  }
}

const bookingEventsIds = ref<string[]>([])
async function handleReserveBooking(eventId: string) {
  if (bookingEventsIds.value.includes(eventId)) {
    return
  }
  bookingEventsIds.value.push(eventId)

  try {
    await reserveBooking(eventId)
    await loadEvents()
  } catch {
    alert('Ошибка участия в событии')
  } finally {
    bookingEventsIds.value = bookingEventsIds.value.filter((id) => id !== eventId)
  }
}
async function handleUnreserveBooking(eventId: string) {
  if (bookingEventsIds.value.includes(eventId)) {
    return
  }
  bookingEventsIds.value.push(eventId)

  try {
    await unreserveBooking(eventId)
    await loadEvents()
  } catch {
    alert('Ошибка не участия в событии')
  } finally {
    bookingEventsIds.value = bookingEventsIds.value.filter((id) => id !== eventId)
  }
}

const deletingEventsIds = ref<string[]>([])
async function handleDeleteEvent(eventId: string) {
  if (deletingEventsIds.value.includes(eventId)) {
    return
  }
  deletingEventsIds.value.push(eventId)

  try {
    await deleteEvent(eventId)
    await loadEvents()
  } catch {
    alert('Ошибка удаления события')
  } finally {
    deletingEventsIds.value = deletingEventsIds.value.filter((id) => id !== eventId)
  }
}

const signOutLoading = ref(false)
async function handleSignOut() {
  signOutLoading.value = true
  try {
    await signOut()
    await router.push('/auth')
  } catch (error: any) {
    alert('Ошибка выхода')
  } finally {
    signOutLoading.value = false
  }
}
</script>
